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

            JsonNode node = objectMapper.readTree(content);
            AiHealthAnalysisResponseDto.AnalysisResult result = parseAnalysisResult(node);

            responseDto.setSuccess(true);
            responseDto.setAnalysisResult(result);
            responseDto.setAnalysisTime(LocalDateTime.now());

            return responseDto;

        } catch (Exception e) {
            log.error("AI分析失败", e);
            return error("AI解析失败：" + e.getMessage());
        }
    }

    // ================= 解析 AI JSON =================
    private AiHealthAnalysisResponseDto.AnalysisResult parseAnalysisResult(JsonNode node) {
        AiHealthAnalysisResponseDto.AnalysisResult result =
                new AiHealthAnalysisResponseDto.AnalysisResult();

        int score = intValue(node, 0, "overallHealthScore", "OverallHealthScore", "score", "Score");
        String level = textValue(node, "未知", "healthLevel", "HealthLevel", "evaluation", "Evaluation");

        result.setScore(score);
        result.setOverallHealthScore(score);
        result.setEvaluation(level);
        result.setHealthLevel(level);
        result.setSummary(textValue(node, "", "summary", "Summary"));

        List<String> problems = textList(firstNode(node, "problems", "Problems"));
        result.setProblems(problems);

        List<String> suggestions = textList(firstNode(node, "suggestions", "Suggestions"));
        result.setSuggestions(suggestions);

        List<AiHealthAnalysisResponseDto.HealthRisk> risks =
                parseRisks(firstNode(node, "healthRisks", "HealthRisks", "risks", "Risks"));
        result.setRisks(risks);
        result.setHealthRisks(risks);

        AiHealthAnalysisResponseDto.NutritionAnalysis nutrition =
                parseNutrition(firstNode(node, "nutritionAnalysis", "NutritionAnalysis", "nutrition", "Nutrition"));
        result.setNutrition(nutrition);
        result.setNutritionAnalysis(nutrition);

        AiHealthAnalysisResponseDto.SportAnalysis sport =
                parseSport(firstNode(node, "sportAnalysis", "SportAnalysis", "sport", "Sport"));
        result.setSport(sport);
        result.setSportAnalysis(sport);

        result.setIndicatorAnalyses(parseIndicators(firstNode(node, "indicatorAnalyses", "IndicatorAnalyses")));
        result.setRecommendations(parseRecommendations(firstNode(node, "recommendations", "Recommendations")));

        if ((result.getSummary() == null || result.getSummary().isBlank()) && !problems.isEmpty()) {
            result.setSummary(String.join("；", problems));
        }

        return result;
    }

    private List<AiHealthAnalysisResponseDto.HealthRisk> parseRisks(JsonNode node) {
        List<AiHealthAnalysisResponseDto.HealthRisk> risks = new ArrayList<>();
        if (node == null || !node.isArray()) return risks;

        for (JsonNode item : node) {
            AiHealthAnalysisResponseDto.HealthRisk risk = new AiHealthAnalysisResponseDto.HealthRisk();
            String type = textValue(item, "健康风险", "riskType", "RiskType", "type", "Type");
            String level = textValue(item, "中", "riskLevel", "RiskLevel", "level", "Level");
            String advice = textValue(item, "", "suggestions", "Suggestions", "advice", "Advice");

            risk.setType(type);
            risk.setRiskType(type);
            risk.setLevel(level);
            risk.setRiskLevel(level);
            risk.setDescription(textValue(item, "", "description", "Description"));
            risk.setAdvice(advice);
            risk.setSuggestions(advice);
            risks.add(risk);
        }
        return risks;
    }

    private AiHealthAnalysisResponseDto.NutritionAnalysis parseNutrition(JsonNode node) {
        AiHealthAnalysisResponseDto.NutritionAnalysis nutrition =
                new AiHealthAnalysisResponseDto.NutritionAnalysis();
        if (node == null || node.isMissingNode() || node.isNull()) {
            nutrition.setDietaryRecommendations(new ArrayList<>());
            return nutrition;
        }

        nutrition.setCalories(doubleObjectValue(node, "calories", "Calories"));
        nutrition.setProtein(doubleObjectValue(node, "protein", "Protein"));
        nutrition.setFat(doubleObjectValue(node, "fat", "Fat"));
        nutrition.setCarbs(doubleObjectValue(node, "carbs", "Carbs", "carbohydrates", "Carbohydrates"));
        nutrition.setEvaluation(textValue(node, "", "evaluation", "Evaluation"));
        nutrition.setNutritionBalanceScore(intObjectValue(node, "nutritionBalanceScore", "NutritionBalanceScore"));
        nutrition.setCalorieIntakeAssessment(textValue(node, "", "calorieIntakeAssessment", "CalorieIntakeAssessment"));
        nutrition.setProteinAssessment(textValue(node, "", "proteinAssessment", "ProteinAssessment"));
        nutrition.setCarbohydrateAssessment(textValue(node, "", "carbohydrateAssessment", "CarbohydrateAssessment"));
        nutrition.setFatAssessment(textValue(node, "", "fatAssessment", "FatAssessment"));
        nutrition.setDietaryRecommendations(textList(firstNode(node, "dietaryRecommendations", "DietaryRecommendations")));
        return nutrition;
    }

    private AiHealthAnalysisResponseDto.SportAnalysis parseSport(JsonNode node) {
        AiHealthAnalysisResponseDto.SportAnalysis sport = new AiHealthAnalysisResponseDto.SportAnalysis();
        if (node == null || node.isMissingNode() || node.isNull()) {
            sport.setExerciseRecommendations(new ArrayList<>());
            return sport;
        }

        sport.setCaloriesBurned(doubleObjectValue(node, "caloriesBurned", "CaloriesBurned"));
        sport.setActivityLevel(textValue(node, "", "activityLevel", "ActivityLevel"));
        sport.setEvaluation(textValue(node, "", "evaluation", "Evaluation"));
        sport.setExerciseVolumeAssessment(textValue(node, "", "exerciseVolumeAssessment", "ExerciseVolumeAssessment"));
        sport.setExerciseFrequencyScore(intObjectValue(node, "exerciseFrequencyScore", "ExerciseFrequencyScore"));
        sport.setCaloriesBurnedAssessment(textValue(node, "", "caloriesBurnedAssessment", "CaloriesBurnedAssessment"));
        sport.setExerciseVarietyAssessment(textValue(node, "", "exerciseVarietyAssessment", "ExerciseVarietyAssessment"));
        sport.setExerciseRecommendations(textList(firstNode(node, "exerciseRecommendations", "ExerciseRecommendations")));
        return sport;
    }

    private List<AiHealthAnalysisResponseDto.IndicatorAnalysis> parseIndicators(JsonNode node) {
        List<AiHealthAnalysisResponseDto.IndicatorAnalysis> indicators = new ArrayList<>();
        if (node == null || !node.isArray()) return indicators;

        for (JsonNode item : node) {
            AiHealthAnalysisResponseDto.IndicatorAnalysis indicator =
                    new AiHealthAnalysisResponseDto.IndicatorAnalysis();
            indicator.setIndicatorName(textValue(item, "", "indicatorName", "IndicatorName"));
            indicator.setIndicatorType(textValue(item, "", "indicatorType", "IndicatorType"));
            JsonNode currentValue = firstNode(item, "currentValue", "CurrentValue");
            if (currentValue != null && !currentValue.isMissingNode() && !currentValue.isNull()) {
                indicator.setCurrentValue(currentValue.isNumber() ? currentValue.numberValue() : currentValue.asText());
            }
            indicator.setNormalRange(textValue(item, "", "normalRange", "NormalRange"));
            indicator.setStatus(textValue(item, "", "status", "Status"));
            indicator.setTrend(textValue(item, "", "trend", "Trend"));
            indicator.setAdvice(textValue(item, "", "advice", "Advice"));
            indicators.add(indicator);
        }
        return indicators;
    }

    private List<AiHealthAnalysisResponseDto.Recommendation> parseRecommendations(JsonNode node) {
        List<AiHealthAnalysisResponseDto.Recommendation> recommendations = new ArrayList<>();
        if (node == null || !node.isArray()) return recommendations;

        for (JsonNode item : node) {
            AiHealthAnalysisResponseDto.Recommendation recommendation =
                    new AiHealthAnalysisResponseDto.Recommendation();
            recommendation.setRecommendationType(textValue(item, "", "recommendationType", "RecommendationType"));
            recommendation.setPriority(textValue(item, "", "priority", "Priority"));
            recommendation.setTitle(textValue(item, "健康建议", "title", "Title"));
            recommendation.setContent(textValue(item, "", "content", "Content"));
            recommendation.setExpectedEffect(textValue(item, "", "expectedEffect", "ExpectedEffect"));
            recommendations.add(recommendation);
        }
        return recommendations;
    }

    private JsonNode firstNode(JsonNode node, String... names) {
        if (node == null) return null;
        for (String name : names) {
            JsonNode child = node.get(name);
            if (child != null && !child.isMissingNode() && !child.isNull()) {
                return child;
            }
        }
        return null;
    }

    private String textValue(JsonNode node, String defaultValue, String... names) {
        JsonNode child = firstNode(node, names);
        if (child == null) return defaultValue;
        String value = child.asText(defaultValue);
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private int intValue(JsonNode node, int defaultValue, String... names) {
        Integer value = intObjectValue(node, names);
        return value == null ? defaultValue : value;
    }

    private Integer intObjectValue(JsonNode node, String... names) {
        JsonNode child = firstNode(node, names);
        if (child == null) return null;
        if (child.isInt() || child.isLong()) return child.asInt();
        if (child.isNumber()) return (int) Math.round(child.asDouble());
        try {
            return Integer.parseInt(child.asText());
        } catch (Exception e) {
            return null;
        }
    }

    private Double doubleObjectValue(JsonNode node, String... names) {
        JsonNode child = firstNode(node, names);
        if (child == null) return null;
        if (child.isNumber()) return child.asDouble();
        try {
            return Double.parseDouble(child.asText());
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> textList(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node == null || !node.isArray()) return values;
        for (JsonNode item : node) {
            values.add(item.asText());
        }
        return values;
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
  "overallHealthScore": 0-100,
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
  "indicatorAnalyses": [
    {
      "indicatorName": "指标名",
      "indicatorType": "指标类型",
      "currentValue": "当前值",
      "normalRange": "正常范围",
      "status": "正常|偏高|偏低",
      "trend": "趋势",
      "advice": "建议"
    }
  ],
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
