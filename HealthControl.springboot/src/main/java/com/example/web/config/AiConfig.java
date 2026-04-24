package com.example.web.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI配置
 */
@Data
@Configuration
public class AiConfig {

    /**
     * DeepSeek API Key
     */
    private String apiKey = "sk-0cd395c9189c4dc69f42b502cc4ca7db";

    /**
     * API URL
     */
    private String apiUrl = "https://api.deepseek.com/chat/completions";

    /**
     * 模型名称
     */
    private String model = "deepseek-chat";

    /**
     * 最大token数
     */
    private Integer maxTokens = 4000;

    /**
     * 温度参数
     */
    private Double temperature = 0.3;

    /**
     * 是否启用模拟模式（用于测试）
     * true: 从本地airesult.txt文件读取模拟数据
     * false: 调用真实的DeepSeek API
     */
    private Boolean mockMode = true;
}