package com.example.web.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * AI健康分析请求DTO（稳定版）
 */
@Data
public class AiHealthAnalysisRequestDto {

    private Integer userId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    /**
     * 用户基础信息（保留核心）
     */
    private UserBasicInfo userBasicInfo;

    /**
     * 饮食数据（AI核心输入）
     */
    private List<DietData> dietRecords;

    /**
     * 运动数据（AI核心输入）
     */
    private List<SportData> sportRecords;

    // ================== 用户信息 ==================
    @Data
    public static class UserBasicInfo {
        private String name;
        private Integer age;
        private String gender;
        private Double height;
        private Double weight;
    }

    // ================== 饮食（核心） ==================
    @Data
    public static class DietData {
        private String foodName;
        private Double calories;
        private Double protein;
        private Double carbohydrates;
        private Double fat;
        private LocalDateTime recordTime;
    }

    // ================== 运动（核心） ==================
    @Data
    public static class SportData {
        private String sportName;
        private Double caloriesBurned;
        private LocalDateTime recordTime;
    }
}