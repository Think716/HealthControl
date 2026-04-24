package com.example.web.tools;

import com.example.web.config.AiConfig;
import com.example.web.tools.dto.DeepSeekRequestDto;
import com.example.web.tools.dto.DeepSeekResponseDto;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@Component
public class DeepSeekApiClient {

    @Autowired
    private AiConfig aiConfig;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public String analyzeHealth(String prompt) {
        try {

            DeepSeekRequestDto request = buildRequest(prompt);

            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + aiConfig.getApiKey());
            headers.put("Content-Type", "application/json");

            String responseStr;

            if (Boolean.TRUE.equals(aiConfig.getMockMode())) {
                responseStr = readMockResponse();
                log.info("Mock模式启动");
            } else {
                responseStr = HttpUtils.Post(aiConfig.getApiUrl(), request, headers);
            }

            if (responseStr == null || responseStr.isBlank()) {
                log.error("AI返回为空");
                return null;
            }

            log.info("DeepSeek原始返回：{}", responseStr);

            // ===================== ⭐ 关键修复 =====================
            String content = extractContent(responseStr);

            if (content == null || content.isBlank()) {
                log.error("content为空");
                return null;
            }

            log.info("提取AI内容：{}", content);

            // 直接返回 JSON 字符串
            return content;

        } catch (Exception e) {
            log.error("DeepSeek调用失败", e);
            return null;
        }
    }

    // ===================== ⭐ 核心优化：安全提取 =====================
    private String extractContent(String responseStr) {
        try {
            JsonNode root = objectMapper.readTree(responseStr);

            JsonNode choices = root.path("choices");

            if (!choices.isArray() || choices.size() == 0) {
                return null;
            }

            JsonNode message = choices.get(0).path("message");

            if (message.isMissingNode()) {
                return null;
            }

            return message.path("content").asText(null);

        } catch (Exception e) {
            log.error("解析DeepSeek结构失败", e);
            return null;
        }
    }

    private DeepSeekRequestDto buildRequest(String prompt) {

        DeepSeekRequestDto request = new DeepSeekRequestDto();
        request.setModel(aiConfig.getModel());
        request.setMax_tokens(aiConfig.getMaxTokens());
        request.setTemperature(aiConfig.getTemperature());

        Map<String, String> format = new HashMap<>();
        format.put("type", "json_object");
        request.setResponse_format(format);

        List<DeepSeekRequestDto.Message> messages = new ArrayList<>();

        messages.add(buildMessage("system", getSystemPrompt()));
        messages.add(buildMessage("user", prompt));

        request.setMessages(messages);

        return request;
    }

    private DeepSeekRequestDto.Message buildMessage(String role, String content) {
        DeepSeekRequestDto.Message m = new DeepSeekRequestDto.Message();
        m.setRole(role);
        m.setContent(content);
        return m;
    }

    private String readMockResponse() {
        try {
            String path = "external-resources/airesult.txt";
            String content = Files.readString(Paths.get(path));
            log.info("读取mock成功");
            return content;
        } catch (IOException e) {
            log.error("读取mock失败", e);
            return """
            {
              "choices": [
                {
                  "message": {
                    "content": "{\\"score\\":80,\\"evaluation\\":\\"一般\\",\\"problems\\":[],\\"suggestions\\":[]}"
                  }
                }
              ]
            }
            """;
        }
    }

    private String getSystemPrompt() {
        return """
你是专业健康分析AI，只允许输出JSON，不允许任何解释文字。

必须严格返回JSON结构，不得多字，不得markdown，不得说明。

输出必须是可解析JSON。
""";
    }
}
