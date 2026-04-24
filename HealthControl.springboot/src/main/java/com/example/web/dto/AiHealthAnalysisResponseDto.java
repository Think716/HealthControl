package com.example.web.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI健康分析响应DTO（论文/毕业设计优化版）
 */
@Data
public class AiHealthAnalysisResponseDto {

    private Boolean success;

    private String errorMessage;

    private AnalysisResult analysisResult;

    private LocalDateTime analysisTime;

    @Data
    public static class AnalysisResult {

        /**
         * 总评分
         */
        private Integer score;

        /**
         * 健康等级
         */
        private String evaluation;

        /**
         * 总体摘要（论文加分点）
         */
        private String summary;

        /**
         * 风险列表（核心加分）
         */
        private List<HealthRisk> risks;

        /**
         * 营养分析
         */
        private NutritionAnalysis nutrition;

        /**
         * 运动分析
         */
        private SportAnalysis sport;

        /**
         * 问题列表
         */
        private List<String> problems;

        /**
         * 建议列表
         */
        private List<String> suggestions;
    }

    @Data
    public static class HealthRisk {

        private String type;     // 风险类型

        private String level;    // 低/中/高

        private String description;

        private String advice;
    }

    @Data
    public static class NutritionAnalysis {

        private Double calories;

        private Double protein;

        private Double fat;

        private Double carbs;

        private String evaluation;
    }

    @Data
    public static class SportAnalysis {

        private Double caloriesBurned;

        private String activityLevel;

        private String evaluation;
    }
}
