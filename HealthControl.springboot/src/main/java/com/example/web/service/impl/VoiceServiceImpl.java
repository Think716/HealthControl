package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.web.dto.VoiceFoodItemDto;
import com.example.web.dto.VoiceRecognizeRequestDto;
import com.example.web.dto.VoiceRecognizeResponseDto;
import com.example.web.entity.DietRecord;
import com.example.web.entity.Food;
import com.example.web.entity.FoodUnit;
import com.example.web.mapper.DietRecordMapper;
import com.example.web.mapper.FoodMapper;
import com.example.web.mapper.FoodUnitMapper;
import com.example.web.service.VoiceService;
import com.example.web.tools.XfyunSpeechRecognizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VoiceServiceImpl implements VoiceService {

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private FoodUnitMapper foodUnitMapper;

    @Autowired
    private DietRecordMapper dietRecordMapper;

    @Autowired
    private XfyunSpeechRecognizer xfyunSpeechRecognizer;

    // 修正：去掉多余空格
    private static final Pattern COUNT_PATTERN =
            Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(个|碗|杯|份|克|g|ml|毫升|片|块|根|只)?",
                    Pattern.CASE_INSENSITIVE);

    // ===================== 语音入口 =====================
    @Override
    public VoiceRecognizeResponseDto recognizeAndSave(Integer userId, MultipartFile file) {

        VoiceRecognizeResponseDto responseDto = new VoiceRecognizeResponseDto();
        responseDto.setSavedCount(0);

        if (userId == null || userId <= 0 || file == null || file.isEmpty()) {
            return responseDto;
        }

        try {
            // 1. 语音转文字
            String text = xfyunSpeechRecognizer.recognize(file.getBytes());
            responseDto.setText(text);

            if (text == null || text.trim().isEmpty()) {
                responseDto.getUnmatchedTexts().add("未识别到有效内容");
                return responseDto;
            }

            // 2. 复用文本解析
            VoiceRecognizeRequestDto dto = new VoiceRecognizeRequestDto();
            dto.setUserId(userId);
            dto.setText(text);
            dto.setRecordTime(LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            return recognizeTextAndSave(dto);

        } catch (Exception e) {
            responseDto.getUnmatchedTexts().add("语音识别失败：" + e.getMessage());
            return responseDto;
        }
    }

    // ===================== 文本解析主逻辑 =====================
    @Override
    public VoiceRecognizeResponseDto recognizeTextAndSave(VoiceRecognizeRequestDto requestDto) {

        VoiceRecognizeResponseDto responseDto = new VoiceRecognizeResponseDto();

        String text = requestDto.getText() == null ? "" : requestDto.getText().trim();
        responseDto.setText(text);
        responseDto.setSavedCount(0);

        if (requestDto.getUserId() == null || requestDto.getUserId() <= 0 || text.isEmpty()) {
            return responseDto;
        }

        List<Food> foods = foodMapper.selectList(Wrappers.lambdaQuery(Food.class));

        if (foods == null || foods.isEmpty()) {
            responseDto.getUnmatchedTexts().add(text);
            return responseDto;
        }

        List<VoiceFragment> fragments = parseVoiceText(text);

        int savedCount = 0;

        for (VoiceFragment fragment : fragments) {

            Food matchFood = findBestFoodMatch(fragment.normalizedText, foods);

            if (matchFood == null) {
                responseDto.getUnmatchedTexts().add(fragment.sourceText);
                continue;
            }

            FoodUnit unit = chooseFoodUnit(matchFood.getId(), fragment.unitKeyword);

            if (unit == null) {
                responseDto.getUnmatchedTexts().add(fragment.sourceText);
                continue;
            }

            DietRecord record = new DietRecord();
            record.setFoodId(matchFood.getId());
            record.setFoodUnitId(unit.getId());
            record.setRecordUserId(requestDto.getUserId());
            record.setRecordTime(parseRecordTime(requestDto.getRecordTime()));
            record.setRecordValue(Math.max(1, (int) Math.round(fragment.count)));

            dietRecordMapper.insert(record);
            savedCount++;

            VoiceFoodItemDto item = new VoiceFoodItemDto();
            item.setFoodName(matchFood.getName());
            item.setCount(record.getRecordValue());
            item.setUnitName(unit.getUnitName());
            item.setMatched(true);

            responseDto.getMatchedItems().add(item);
        }

        responseDto.setSavedCount(savedCount);
        return responseDto;
    }

    // ===================== 文本拆分 =====================
    private List<VoiceFragment> parseVoiceText(String rawText) {

        List<VoiceFragment> list = new ArrayList<>();

        String[] parts = rawText
                .replace("，", ",")
                .replace("。", ",")
                .replace("；", ",")
                .replace("、", ",")
                .split(",");

        for (String part : parts) {
            if (part == null || part.trim().isEmpty()) continue;

            VoiceFragment f = new VoiceFragment();
            f.sourceText = part.trim();
            f.normalizedText = normalizeText(f.sourceText);
            f.count = extractCount(f.sourceText);
            f.unitKeyword = extractUnitKeyword(f.sourceText);

            list.add(f);
        }

        if (list.isEmpty() && !rawText.isEmpty()) {
            VoiceFragment f = new VoiceFragment();
            f.sourceText = rawText;
            f.normalizedText = normalizeText(rawText);
            f.count = extractCount(rawText);
            f.unitKeyword = extractUnitKeyword(rawText);
            list.add(f);
        }

        return list;
    }

    // ===================== 文本清洗 =====================
    private String normalizeText(String text) {
        return text
                .replace("吃了", "")
                .replace("喝了", "")
                .replace("我", "")
                .replace("今天", "")
                .replace("早餐", "")
                .replace("午餐", "")
                .replace("晚餐", "")
                .replace("加餐", "")
                .replace("记录", "")
                .replace("一下", "")
                .trim();
    }

    // ===================== 数量识别 =====================
    private double extractCount(String text) {

        Matcher matcher = COUNT_PATTERN.matcher(text);

        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (Exception ignored) {}
        }

        Map<String, Integer> cnNum = new LinkedHashMap<>();
        cnNum.put("两", 2);
        cnNum.put("一", 1);
        cnNum.put("二", 2);
        cnNum.put("三", 3);
        cnNum.put("四", 4);
        cnNum.put("五", 5);
        cnNum.put("六", 6);
        cnNum.put("七", 7);
        cnNum.put("八", 8);
        cnNum.put("九", 9);
        cnNum.put("十", 10);

        for (Map.Entry<String, Integer> e : cnNum.entrySet()) {
            if (text.contains(e.getKey())) {
                return e.getValue();
            }
        }

        return 1;
    }

    // ===================== 单位识别 =====================
    private String extractUnitKeyword(String text) {

        Matcher matcher = COUNT_PATTERN.matcher(text);

        if (matcher.find() && matcher.group(2) != null) {
            return matcher.group(2).toLowerCase();
        }

        String[] units = {"个", "碗", "杯", "份", "克", "g", "ml", "毫升", "片", "块", "根", "只"};

        for (String u : units) {
            if (text.toLowerCase().contains(u)) {
                return u;
            }
        }

        return "";
    }

    // ===================== 食物匹配 =====================
    private Food findBestFoodMatch(String text, List<Food> foods) {

        if (text == null || text.isEmpty()) return null;

        for (Food food : foods) {
            if (food.getName() != null &&
                    (text.contains(food.getName()) || food.getName().contains(text))) {
                return food;
            }
        }

        return null;
    }

    // ===================== 单位选择 =====================
    private FoodUnit chooseFoodUnit(Integer foodId, String unitKeyword) {

        List<FoodUnit> units = foodUnitMapper.selectList(
                new LambdaQueryWrapper<FoodUnit>()
                        .eq(FoodUnit::getFoodId, foodId)
        );

        if (units == null || units.isEmpty()) return null;

        if (unitKeyword == null || unitKeyword.isEmpty()) {
            return units.get(0);
        }

        for (FoodUnit u : units) {
            if (u.getUnitName() != null &&
                    u.getUnitName().toLowerCase().contains(unitKeyword)) {
                return u;
            }
        }

        return units.get(0);
    }

    // ===================== 时间解析 =====================
    private LocalDateTime parseRecordTime(String time) {

        if (time == null || time.isEmpty()) {
            return LocalDateTime.now();
        }

        try {
            return LocalDateTime.parse(time,
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    // ===================== 内部类 =====================
    private static class VoiceFragment {
        String sourceText;
        String normalizedText;
        double count;
        String unitKeyword;
    }
}