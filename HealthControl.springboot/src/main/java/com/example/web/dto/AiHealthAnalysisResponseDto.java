package com.example.web.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * AI健康分析响应DTO（稳定版）
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
         * 健康评分 (0-100)
         */
        private Integer score;

        /**
         * 健康评价
         */
        private String evaluation;

        /**
         * 主要问题
         */
        private List<String> problems;

        /**
         * 改进建议
         */
        private List<String> suggestions;
    }
}
