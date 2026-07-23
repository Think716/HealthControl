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
         * 页面展示用总评分
         */
        private Integer overallHealthScore;

        /**
         * 健康等级
         */
        private String evaluation;

        /**
         * 页面展示用健康等级
         */
        private String healthLevel;

        /**
         * 总体摘要（论文加分点）
         */
        private String summary;

        /**
         * 风险列表（核心加分）
         */
        private List<HealthRisk> risks;

        /**
         * 页面展示用风险列表
         */
        private List<HealthRisk> healthRisks;

        /**
         * 营养分析
         */
        private NutritionAnalysis nutrition;

        /**
         * 页面展示用营养分析
         */
        private NutritionAnalysis nutritionAnalysis;

        /**
         * 运动分析
         */
        private SportAnalysis sport;

        /**
         * 页面展示用运动分析
         */
        private SportAnalysis sportAnalysis;

        /**
         * 页面展示用指标分析
         */
        private List<IndicatorAnalysis> indicatorAnalyses;

        /**
         * 页面展示用综合建议
         */
        private List<Recommendation> recommendations;

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

        private String riskType;

        private String level;    // 低/中/高

        private String riskLevel;

        private String description;

        private String advice;

        private String suggestions;
    }

    @Data
    public static class NutritionAnalysis {

        private Double calories;

        private Double protein;

        private Double fat;

        private Double carbs;

        private String evaluation;

        private Integer nutritionBalanceScore;

        private String calorieIntakeAssessment;

        private String proteinAssessment;

        private String carbohydrateAssessment;

        private String fatAssessment;

        private List<String> dietaryRecommendations;
    }

    @Data
    public static class SportAnalysis {

        private Double caloriesBurned;

        private String activityLevel;

        private String evaluation;

        private String exerciseVolumeAssessment;

        private Integer exerciseFrequencyScore;

        private String caloriesBurnedAssessment;

        private String exerciseVarietyAssessment;

        private List<String> exerciseRecommendations;
    }

    @Data
    public static class IndicatorAnalysis {

        private String indicatorName;

        private String indicatorType;

        private Object currentValue;

        private String normalRange;

        private String status;

        private String trend;

        private String advice;
    }

    @Data
    public static class Recommendation {

        private String recommendationType;

        private String priority;

        private String title;

        private String content;

        private String expectedEffect;
    }
}
