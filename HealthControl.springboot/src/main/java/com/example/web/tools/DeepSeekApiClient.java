package com.example.web.tools;

import com.example.web.config.AiConfig;
import com.example.web.dto.DeepSeekRequestDto;
import com.example.web.dto.AiHealthAnalysisResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
public class DeepSeekApiClient {

    @Autowired
    private AiConfig aiConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * ⭐ AI分析入口（稳定版）
     */
    public AiHealthAnalysisResponseDto analyzeHealth(String prompt) {

        AiHealthAnalysisResponseDto responseDto = new AiHealthAnalysisResponseDto();

        try {

            DeepSeekRequestDto request = buildRequest(prompt);

            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + aiConfig.getApiKey());
            headers.put("Content-Type", "application/json");

            String responseStr = Boolean.TRUE.equals(aiConfig.getMockMode())
                    ? readMockResponse()
                    : HttpUtils.Post(aiConfig.getApiUrl(), request, headers);

            if (responseStr == null || responseStr.isBlank()) {
                return error("AI返回为空");
            }

            String content = extractContent(responseStr);
            content = cleanContent(content);

            if (content == null || content.isBlank()) {
                return error("AI content为空");
            }

            log.info("AI原始内容：{}", content);

            // ================== ⭐关键修复点 ==================
            JsonNode node = objectMapper.readTree(content);

            AiHealthAnalysisResponseDto.AnalysisResult result =
                    new AiHealthAnalysisResponseDto.AnalysisResult();

            // 安全解析（避免 null）
            result.setScore(node.path("score").asInt(0));
            result.setEvaluation(node.path("evaluation").asText("未知"));

            // problems
            List<String> problems = new ArrayList<>();
            JsonNode pNode = node.path("problems");
            if (pNode.isArray()) {
                for (JsonNode p : pNode) {
                    problems.add(p.asText());
                }
            }
            result.setProblems(problems);

            // suggestions
            List<String> suggestions = new ArrayList<>();
            JsonNode sNode = node.path("suggestions");
            if (sNode.isArray()) {
                for (JsonNode s : sNode) {
                    suggestions.add(s.asText());
                }
            }
            result.setSuggestions(suggestions);

            responseDto.setSuccess(true);
            responseDto.setAnalysisResult(result);
            responseDto.setAnalysisTime(LocalDateTime.now());

            return responseDto;

        } catch (Exception e) {
            log.error("AI分析失败", e);
            return error("AI解析失败：" + e.getMessage());
        }
    }

    // ================= 请求构建 =================
    private DeepSeekRequestDto buildRequest(String prompt) {

        Map<String, String> format = new HashMap<>();
        format.put("type", "json_object");

        List<DeepSeekRequestDto.Message> messages = new ArrayList<>();
        messages.add(buildMessage("system", getSystemPrompt()));
        messages.add(buildMessage("user", prompt));

        return DeepSeekRequestDto.builder()
                .model(aiConfig.getModel())
                .messages(messages)
                .responseFormat(format)
                .maxTokens(aiConfig.getMaxTokens())
                .temperature(aiConfig.getTemperature())
                .build();
    }

    private DeepSeekRequestDto.Message buildMessage(String role, String content) {
        return DeepSeekRequestDto.Message.builder()
                .role(role)
                .content(content)
                .build();
    }

    // ================= 提取 AI content =================
    private String extractContent(String responseStr) {
        try {
            JsonNode root = objectMapper.readTree(responseStr);
            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText(null);
        } catch (Exception e) {
            log.error("AI响应解析失败", e);
            return null;
        }
    }

    // ================= 清洗 =================
    private String cleanContent(String content) {
        if (content == null) return null;

        return content
                .replace("```json", "")
                .replace("```", "")
                .trim();
    }

    // ================= mock =================
    private String readMockResponse() {
        try {
            return Files.readString(Paths.get("external-resources/airesult.txt"));
        } catch (IOException e) {
            return """
            {
              "choices": [
                {
                  "message": {
                    "content": "{\\"score\\":85,\\"evaluation\\":\\"良好\\",\\"problems\\":[],\\"suggestions\\":[\\"多喝水\\",\\"规律饮食\\"]}"
                  }
                }
              ]
            }
            """;
        }
    }

    // ================= system prompt =================
    private String getSystemPrompt() {
        return """
你是专业健康分析AI，只输出JSON，不允许任何解释文字。

必须严格返回：
{
  "score": 0-100,
  "evaluation": "良好|一般|较差",
  "problems": ["问题1"],
  "suggestions": ["建议1","建议2"]
}
""";
    }

    // ================= error =================
    private AiHealthAnalysisResponseDto error(String msg) {
        AiHealthAnalysisResponseDto dto = new AiHealthAnalysisResponseDto();
        dto.setSuccess(false);
        dto.setErrorMessage(msg);
        dto.setAnalysisTime(LocalDateTime.now());
        return dto;
    }
}
