package com.example.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * DeepSeek API响应DTO（工业级稳定版）
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeepSeekResponseDto {

    private String id;
    private String object;
    private Long created;
    private String model;

    private List<Choice> choices;

    private Usage usage;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {

        private Integer index;

        private Message message;

        private String finish_reason;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {

        private String role;

        private String content;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Usage {

        private Integer prompt_tokens;
        private Integer completion_tokens;
        private Integer total_tokens;
    }
}
