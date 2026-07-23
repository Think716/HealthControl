package com.example.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DeepSeekRequestDto {

    private String model;

    private List<Message> messages;

    @JsonProperty("response_format")
    private Map<String, String> responseFormat;

    @JsonProperty("max_tokens")
    private Integer maxTokens;

    private Double temperature;

    @Data
    @Builder
    public static class Message {
        private String role;
        private String content;
    }
}