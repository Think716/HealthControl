package com.example.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.web.dto.*;
import com.example.web.dto.query.SportRecordPagedInput;
import com.example.web.entity.*;
import com.example.web.mapper.*;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/SportRecord")
public class SportRecordController {

    @Autowired
    private SportRecordMapper sportRecordMapper;
    @Autowired
    private SportMapper sportMapper;
    @Autowired
    private SportUnitMapper sportUnitMapper;
    @Autowired
    private DietRecordMapper dietRecordMapper;
    @Autowired
    private FoodMapper foodMapper;
    @Autowired
    private FoodUnitMapper foodUnitMapper;
    @Autowired
    private AppUserMapper appUserMapper;
    @Autowired
    private CommunityPostMapper communityPostMapper;
    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    @SneakyThrows
    public SportRecordDto CreateOrEdit(@RequestBody SportRecordDto input) {
        SportRecord record = input.MapToEntity();
        if (record.getSportId() == null && record.getSportUnitId() != null) {
            SportUnit unit = sportUnitMapper.selectById(record.getSportUnitId());
            if (unit != null) {
                record.setSportId(unit.getSportId());
            }
        }
        sportRecordMapper.insert(record);
        return toDto(record);
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        if (input != null && input.getId() != null) {
            sportRecordMapper.deleteById(input.getId());
        }
    }

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public List<SportRecordDto> List(@RequestBody SportRecordPagedInput input) {
        LambdaQueryWrapper<SportRecord> query = buildQuery(input).orderByDesc(SportRecord::getRecordTime);
        return toDtos(sportRecordMapper.selectList(query));
    }

    @RequestMapping(value = "/TodaySummary", method = RequestMethod.POST)
    @SneakyThrows
    public SportDashboardDto TodaySummary(@RequestBody SportRecordPagedInput input) {
        LocalDate date = LocalDate.now();
        if (input != null && input.getRecordTimeRange() != null && !input.getRecordTimeRange().isEmpty()) {
            date = input.getRecordTimeRange().get(0).toLocalDate();
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusSeconds(1);
        Integer userId = input == null ? null : input.getRecordUserId();

        SportRecordPagedInput queryInput = new SportRecordPagedInput();
        queryInput.setRecordUserId(userId);
        queryInput.setRecordTimeRange(List.of(start, end));
        List<SportRecordDto> sportRecords = List(queryInput);

        double intake = calculateIntakeCalories(userId, start, end);
        double burned = sportRecords.stream().mapToDouble(r -> safe(r.getCaloriesBurned())).sum();

        SportDashboardDto dto = new SportDashboardDto();
        dto.setIntakeCalories(Extension.ToFixed4(intake));
        dto.setBurnedCalories(Extension.ToFixed4(burned));
        dto.setNetCalories(Extension.ToFixed4(intake - burned));
        dto.setRecordCount(sportRecords.size());
        dto.setIsChecked(!sportRecords.isEmpty());
        dto.setSuggestion(buildSuggestion(intake, burned, sportRecords.size()));
        UserGrowthDto growth = buildGrowth(userId);
        dto.setContinuousDays(growth.getContinuousDays());
        dto.setPoints(growth.getPoints());
        dto.setBadges(growth.getBadges());
        dto.setSportRecords(sportRecords);
        return dto;
    }

    @RequestMapping(value = "/GrowthSummary", method = RequestMethod.POST)
    public UserGrowthDto GrowthSummary(@RequestBody SportRecordPagedInput input) {
        return buildGrowth(input == null ? null : input.getRecordUserId());
    }

    @RequestMapping(value = "/Leaderboard", method = RequestMethod.POST)
    @SneakyThrows
    public List<java.util.HashMap<String, Object>> Leaderboard(@RequestBody java.util.HashMap<String, Object> input) {
        String type = input == null ? "week" : String.valueOf(input.getOrDefault("Type", "week"));
        LocalDate endDate = LocalDate.now().plusDays(1);
        LocalDate startDate = "month".equalsIgnoreCase(type) ? endDate.minusMonths(1) : endDate.minusDays(7);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atStartOfDay();
        List<SportRecord> records = sportRecordMapper.selectList(Wrappers.<SportRecord>lambdaQuery()
                .ge(SportRecord::getRecordTime, start)
                .lt(SportRecord::getRecordTime, end));
        java.util.Map<Integer, Double> calories = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> checkDays = new java.util.HashMap<>();
        java.util.Map<Integer, java.util.Set<LocalDate>> dateMap = new java.util.HashMap<>();
        for (SportRecord record : records) {
            Integer userId = record.getRecordUserId();
            SportUnit unit = sportUnitMapper.selectById(record.getSportUnitId());
            calories.merge(userId, calculateBurned(unit, record.getRecordValue()), Double::sum);
            dateMap.computeIfAbsent(userId, k -> new java.util.HashSet<>()).add(record.getRecordTime().toLocalDate());
        }
        dateMap.forEach((userId, dates) -> checkDays.put(userId, dates.size()));
        List<java.util.HashMap<String, Object>> rows = new ArrayList<>();
        for (Integer userId : calories.keySet()) {
            AppUser user = appUserMapper.selectById(userId);
            java.util.HashMap<String, Object> row = new java.util.HashMap<>();
            row.put("UserId", userId);
            row.put("UserName", user == null ? "健康用户" : (user.getName() == null ? user.getUserName() : user.getName()));
            row.put("ImageUrls", user == null ? "" : user.getImageUrls());
            row.put("CheckDays", checkDays.getOrDefault(userId, 0));
            row.put("BurnedCalories", Extension.ToFixed4(calories.getOrDefault(userId, 0d)));
            row.put("Points", calcPoints(checkDays.getOrDefault(userId, 0), calories.getOrDefault(userId, 0d)));
            rows.add(row);
        }
        rows.sort((a, b) -> Integer.compare((Integer) b.get("Points"), (Integer) a.get("Points")));
        for (int i = 0; i < rows.size(); i++) rows.get(i).put("Rank", i + 1);
        return rows.size() > 20 ? rows.subList(0, 20) : rows;
    }

    @RequestMapping(value = "/ShareSportRecord", method = RequestMethod.POST)
    public CommunityPost ShareSportRecord(@RequestBody java.util.HashMap<String, Object> input) {
        Integer userId = toInt(input.get("UserId"));
        UserGrowthDto growth = buildGrowth(userId);
        CommunityPost post = new CommunityPost();
        post.setPublishUserId(userId);
        post.setPostType("运动成果分享");
        post.setTags("#运动打卡,#积分成长");
        post.setSourceType("运动打卡");
        post.setAuditStatus(1);
        post.setStatus(1);
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setCollectCount(0);
        post.setContent("今日运动打卡完成，已连续坚持" + growth.getContinuousDays() + "天，累计积分" + growth.getPoints() + "分。");
        post.setAiComment("AI助手：持续打卡可以形成稳定运动习惯，建议继续保持循序渐进的训练节奏。");
        communityPostMapper.insert(post);
        return post;
    }

    private LambdaQueryWrapper<SportRecord> buildQuery(SportRecordPagedInput input) {
        LambdaQueryWrapper<SportRecord> query = Wrappers.<SportRecord>lambdaQuery();
        if (input == null) return query;
        query.eq(input.getId() != null && input.getId() != 0, SportRecord::getId, input.getId());
        query.eq(input.getRecordUserId() != null, SportRecord::getRecordUserId, input.getRecordUserId());
        query.eq(input.getSportId() != null, SportRecord::getSportId, input.getSportId());
        query.eq(input.getSportUnitId() != null, SportRecord::getSportUnitId, input.getSportUnitId());
        if (input.getRecordTimeRange() != null && input.getRecordTimeRange().size() >= 2) {
            query.ge(SportRecord::getRecordTime, input.getRecordTimeRange().get(0));
            query.le(SportRecord::getRecordTime, input.getRecordTimeRange().get(1));
        }
        return query;
    }

    private List<SportRecordDto> toDtos(List<SportRecord> records) throws Exception {
        List<SportRecordDto> result = new ArrayList<>();
        for (SportRecord record : records) {
            result.add(toDto(record));
        }
        return result;
    }

    private SportRecordDto toDto(SportRecord record) throws Exception {
        SportRecordDto dto = record.MapToDto();
        Sport sport = sportMapper.selectById(record.getSportId());
        SportUnit unit = sportUnitMapper.selectById(record.getSportUnitId());
        dto.setSportDto(sport == null ? new SportDto() : sport.MapToDto());
        dto.setSportUnitDto(unit == null ? new SportUnitDto() : unit.MapToDto());
        dto.setCaloriesBurned(calculateBurned(unit, record.getRecordValue()));
        return dto;
    }

    private double calculateBurned(SportUnit unit, Integer value) {
        if (unit == null || value == null) return 0d;
        double unitValue = safe(unit.getUnitValue());
        double calories = safe(unit.getCalories());
        if (unitValue <= 0) unitValue = 1d;
        return Extension.ToFixed4(value * calories / unitValue);
    }

    private double calculateIntakeCalories(Integer userId, LocalDateTime start, LocalDateTime end) {
        if (userId == null) return 0d;
        List<DietRecord> records = dietRecordMapper.selectList(
                Wrappers.<DietRecord>lambdaQuery()
                        .eq(DietRecord::getRecordUserId, userId)
                        .ge(DietRecord::getRecordTime, start)
                        .le(DietRecord::getRecordTime, end)
        );

        double total = 0d;
        for (DietRecord record : records) {
            Food food = foodMapper.selectById(record.getFoodId());
            FoodUnit unit = foodUnitMapper.selectById(record.getFoodUnitId());
            if (food == null || unit == null || record.getRecordValue() == null) continue;
            total += safe(food.getCalories()) * safe(unit.getUnitValue()) * record.getRecordValue();
        }
        return total;
    }

    private String buildSuggestion(double intake, double burned, int recordCount) {
        if (recordCount == 0) {
            return "今天还没有运动打卡，建议从快走30分钟或跳绳10分钟开始。";
        }
        double net = intake - burned;
        if (burned < 200) {
            return "已完成打卡，消耗略低，可以再补充15-20分钟快走。";
        }
        if (net > 1800) {
            return "今日净热量偏高，晚间适合安排低强度有氧或控制加餐。";
        }
        if (net < 900) {
            return "今日净热量偏低，注意补充蛋白质和主食，避免过度消耗。";
        }
        return "今日摄入与消耗比较均衡，保持当前运动节奏。";
    }

    private UserGrowthDto buildGrowth(Integer userId) {
        UserGrowthDto dto = new UserGrowthDto();
        dto.setCheckDays(0);
        dto.setMonthCheckDays(0);
        dto.setContinuousDays(0);
        dto.setTotalBurnedCalories(0d);
        dto.setPoints(0);
        dto.setLevelName("健康新手");
        if (userId == null) return dto;

        List<SportRecord> records = sportRecordMapper.selectList(Wrappers.<SportRecord>lambdaQuery()
                .eq(SportRecord::getRecordUserId, userId)
                .orderByDesc(SportRecord::getRecordTime));
        java.util.Set<LocalDate> days = new java.util.HashSet<>();
        double totalBurned = 0d;
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        for (SportRecord record : records) {
            if (record.getRecordTime() == null) continue;
            days.add(record.getRecordTime().toLocalDate());
            SportUnit unit = sportUnitMapper.selectById(record.getSportUnitId());
            totalBurned += calculateBurned(unit, record.getRecordValue());
        }
        int monthDays = (int) days.stream().filter(day -> !day.isBefore(monthStart)).count();
        int continuousDays = 0;
        LocalDate cursor = LocalDate.now();
        while (days.contains(cursor)) {
            continuousDays++;
            cursor = cursor.minusDays(1);
        }
        int points = calcPoints(days.size(), totalBurned);
        dto.setCheckDays(days.size());
        dto.setMonthCheckDays(monthDays);
        dto.setContinuousDays(continuousDays);
        dto.setTotalBurnedCalories(Extension.ToFixed4(totalBurned));
        dto.setPoints(points);
        dto.setLevelName(points >= 1000 ? "健康达人" : points >= 500 ? "自律进阶" : points >= 150 ? "坚持之星" : "健康新手");
        if (continuousDays >= 3) dto.getBadges().add("连续3天");
        if (continuousDays >= 7) dto.getBadges().add("连续7天");
        if (monthDays >= 15) dto.getBadges().add("月度坚持");
        if (totalBurned >= 3000) dto.getBadges().add("燃脂达人");
        if (dto.getBadges().isEmpty()) dto.getBadges().add("初次打卡");
        return dto;
    }

    private int calcPoints(int checkDays, double burnedCalories) {
        return checkDays * 10 + (int) Math.round(burnedCalories / 20d);
    }

    private Integer toInt(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        return Integer.parseInt(value.toString());
    }

    private double safe(Number value) {
        return value == null ? 0d : value.doubleValue();
    }
}
