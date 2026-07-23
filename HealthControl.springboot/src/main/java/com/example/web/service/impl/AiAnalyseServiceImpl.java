package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.web.dto.*;
import com.example.web.entity.*;
import com.example.web.mapper.*;
import com.example.web.service.AiAnalyseService;
import com.example.web.tools.DeepSeekApiClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AiAnalyseServiceImpl implements AiAnalyseService {

    @Autowired
    private DeepSeekApiClient deepSeekApiClient;

    @Autowired
    private AppUserMapper appUserMapper;

    @Autowired
    private DietRecordMapper dietRecordMapper;

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private FoodUnitMapper foodUnitMapper;

    @Autowired
    private SportRecordMapper sportRecordMapper;

    @Autowired
    private SportMapper sportMapper;

    @Autowired
    private SportUnitMapper sportUnitMapper;

    @Override
    public AiHealthAnalysisResponseDto analyzeUserHealth(Integer userId, Integer days) {
        try {
            AiHealthAnalysisRequestDto requestDto = buildUserHealthData(userId, days);
            return analyzeHealthData(requestDto);
        } catch (Exception e) {
            log.error("分析失败 userId={}", userId, e);
            return buildErrorResponse("数据获取失败：" + e.getMessage());
        }
    }

    @Override
    public AiHealthAnalysisResponseDto analyzeHealthData(AiHealthAnalysisRequestDto requestDto) {
        try {

            int score = calculateScore(requestDto);

            String prompt = buildAnalysisPrompt(requestDto, score);

            // ===================== ⭐关键修复 =====================
            AiHealthAnalysisResponseDto aiResponse =
                    deepSeekApiClient.analyzeHealth(prompt);

            if (aiResponse == null) {
                return buildErrorResponse("AI返回为空");
            }

            // ===================== 构造统一返回 =====================
            AiHealthAnalysisResponseDto response = new AiHealthAnalysisResponseDto();
            response.setSuccess(true);
            response.setAnalysisTime(LocalDateTime.now());

            AiHealthAnalysisResponseDto.AnalysisResult result =
                    aiResponse.getAnalysisResult();

            // ❗安全兜底（防止AI字段缺失）
            if (result == null) {
                result = new AiHealthAnalysisResponseDto.AnalysisResult();
                result.setScore(score);
                result.setOverallHealthScore(score);
                result.setEvaluation("一般");
                result.setHealthLevel("一般");
                result.setProblems(new ArrayList<>());
                result.setSuggestions(new ArrayList<>());
                result.setHealthRisks(new ArrayList<>());
                result.setIndicatorAnalyses(new ArrayList<>());
                result.setRecommendations(new ArrayList<>());
            } else {

                if (result.getScore() == null) {
                    result.setScore(score);
                }
                if (result.getOverallHealthScore() == null) {
                    result.setOverallHealthScore(result.getScore());
                }

                if (result.getProblems() == null) {
                    result.setProblems(new ArrayList<>());
                }

                if (result.getSuggestions() == null) {
                    result.setSuggestions(new ArrayList<>());
                }

                if (result.getEvaluation() == null) {
                    result.setEvaluation(result.getHealthLevel() == null ? "一般" : result.getHealthLevel());
                }

                if (result.getHealthLevel() == null) {
                    result.setHealthLevel(result.getEvaluation());
                }

                if (result.getHealthRisks() == null) {
                    result.setHealthRisks(result.getRisks() == null ? new ArrayList<>() : result.getRisks());
                }

                if (result.getRisks() == null) {
                    result.setRisks(result.getHealthRisks());
                }

                if (result.getNutritionAnalysis() == null) {
                    result.setNutritionAnalysis(result.getNutrition());
                }

                if (result.getNutrition() == null) {
                    result.setNutrition(result.getNutritionAnalysis());
                }

                if (result.getSportAnalysis() == null) {
                    result.setSportAnalysis(result.getSport());
                }

                if (result.getSport() == null) {
                    result.setSport(result.getSportAnalysis());
                }

                if (result.getIndicatorAnalyses() == null) {
                    result.setIndicatorAnalyses(new ArrayList<>());
                }

                if (result.getRecommendations() == null) {
                    result.setRecommendations(new ArrayList<>());
                }
            }

            response.setAnalysisResult(result);

            return response;

        } catch (Exception e) {
            log.error("AI分析异常", e);
            return buildErrorResponse("AI分析失败：" + e.getMessage());
        }
    }

    // ===================== 评分 =====================
    private int calculateScore(AiHealthAnalysisRequestDto dto) {

        double calories = 0;
        double protein = 0;
        double fat = 0;
        double burned = 0;

        if (dto.getDietRecords() != null) {
            for (AiHealthAnalysisRequestDto.DietData d : dto.getDietRecords()) {
                calories += safe(d.getCalories());
                protein += safe(d.getProtein());
                fat += safe(d.getFat());
            }
        }
        if (dto.getSportRecords() != null) {
            for (AiHealthAnalysisRequestDto.SportData s : dto.getSportRecords()) {
                burned += safe(s.getCaloriesBurned());
            }
        }

        int score = 100;

        if (calories > 2400) score -= 15;
        if (calories < 1500) score -= 10;
        if (fat > 90) score -= 15;
        if (protein < 45) score -= 10;
        if (burned < 150) score -= 10;

        return Math.max(score, 0);
    }

    private double safe(Number v) {
        return v == null ? 0 : v.doubleValue();
    }

    // ===================== Prompt =====================
    private String buildAnalysisPrompt(AiHealthAnalysisRequestDto dto, int score) {

        double cal = 0, p = 0, f = 0, c = 0, burned = 0;

        if (dto.getDietRecords() != null) {
            for (AiHealthAnalysisRequestDto.DietData d : dto.getDietRecords()) {
                cal += safe(d.getCalories());
                p += safe(d.getProtein());
                f += safe(d.getFat());
                c += safe(d.getCarbohydrates());
            }
        }
        if (dto.getSportRecords() != null) {
            for (AiHealthAnalysisRequestDto.SportData s : dto.getSportRecords()) {
                burned += safe(s.getCaloriesBurned());
            }
        }

        return """
你是专业健康分析AI，只输出JSON，不允许任何解释。

必须返回严格JSON格式：

{
  "overallHealthScore": %d,
  "healthLevel": "良好|一般|较差",
  "summary": "总体分析摘要",
  "healthRisks": [
    {
      "riskType": "风险类型",
      "riskLevel": "低|中|高",
      "description": "风险描述",
      "suggestions": "处理建议"
    }
  ],
  "nutritionAnalysis": {
    "nutritionBalanceScore": 0-100,
    "calorieIntakeAssessment": "热量评价",
    "proteinAssessment": "蛋白质评价",
    "carbohydrateAssessment": "碳水评价",
    "fatAssessment": "脂肪评价",
    "dietaryRecommendations": ["饮食建议"]
  },
  "sportAnalysis": {
    "exerciseVolumeAssessment": "运动量评价",
    "exerciseFrequencyScore": 0-100,
    "caloriesBurnedAssessment": "消耗评价",
    "exerciseVarietyAssessment": "运动类型评价",
    "exerciseRecommendations": ["运动建议"]
  },
  "indicatorAnalyses": [],
  "recommendations": [
    {
      "recommendationType": "饮食|运动|生活习惯|医疗",
      "priority": "高|中|低",
      "title": "建议标题",
      "content": "建议内容",
      "expectedEffect": "预期效果"
    }
  ]
}

数据：
饮食摄入热量:%f
蛋白质:%f
脂肪:%f
碳水:%f
运动消耗热量:%f
净热量:%f
运动记录数量:%d
""".formatted(score, cal, p, f, c, burned, cal - burned, dto.getSportRecords() == null ? 0 : dto.getSportRecords().size());
    }

    // ===================== 用户数据 =====================
    private AiHealthAnalysisRequestDto buildUserHealthData(Integer userId, Integer days) {

        if (days == null || days <= 0) days = 7;

        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);

        AiHealthAnalysisRequestDto dto = new AiHealthAnalysisRequestDto();
        dto.setUserId(userId);
        dto.setStartTime(start);
        dto.setEndTime(end);

        AppUser user = appUserMapper.selectById(userId);

        if (user != null) {
            AiHealthAnalysisRequestDto.UserBasicInfo info =
                    new AiHealthAnalysisRequestDto.UserBasicInfo();

            info.setName(user.getName());

            if (user.getBirth() != null) {
                info.setAge(
                        Period.between(user.getBirth().toLocalDate(), LocalDate.now()).getYears()
                );
            }

            dto.setUserBasicInfo(info);
        }

        List<DietRecord> list = dietRecordMapper.selectList(
                Wrappers.<DietRecord>lambdaQuery()
                        .eq(DietRecord::getRecordUserId, userId)
                        .between(DietRecord::getRecordTime, start, end)
        );

        if (list != null) {
            dto.setDietRecords(list.stream().map(r -> {

                AiHealthAnalysisRequestDto.DietData d =
                        new AiHealthAnalysisRequestDto.DietData();

                Food f = foodMapper.selectById(r.getFoodId());
                FoodUnit u = foodUnitMapper.selectById(r.getFoodUnitId());

                if (f != null && u != null) {
                    double factor = safe(u.getUnitValue()) * safe(r.getRecordValue());

                    d.setFoodName(f.getName());
                    d.setCalories(f.getCalories() * factor);
                    d.setProtein(f.getProtein() * factor);
                    d.setFat(f.getFat() * factor);
                    d.setCarbohydrates(f.getCarbohydrates() * factor);
                }

                return d;
            }).collect(Collectors.toList()));
        }

        List<SportRecord> sportRecords = sportRecordMapper.selectList(
                Wrappers.<SportRecord>lambdaQuery()
                        .eq(SportRecord::getRecordUserId, userId)
                        .between(SportRecord::getRecordTime, start, end)
        );

        if (sportRecords != null) {
            dto.setSportRecords(sportRecords.stream().map(r -> {
                AiHealthAnalysisRequestDto.SportData d =
                        new AiHealthAnalysisRequestDto.SportData();

                Sport sport = sportMapper.selectById(r.getSportId());
                SportUnit unit = sportUnitMapper.selectById(r.getSportUnitId());

                if (sport != null) {
                    d.setSportName(sport.getName());
                }
                if (unit != null && r.getRecordValue() != null) {
                    double unitValue = safe(unit.getUnitValue());
                    if (unitValue <= 0) unitValue = 1;
                    d.setCaloriesBurned(safe(unit.getCalories()) * r.getRecordValue() / unitValue);
                }
                d.setRecordTime(r.getRecordTime());
                return d;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    // ===================== error =====================
    private AiHealthAnalysisResponseDto buildErrorResponse(String msg) {
        AiHealthAnalysisResponseDto r = new AiHealthAnalysisResponseDto();
        r.setSuccess(false);
        r.setErrorMessage(msg);
        r.setAnalysisTime(LocalDateTime.now());
        return r;
    }
}
