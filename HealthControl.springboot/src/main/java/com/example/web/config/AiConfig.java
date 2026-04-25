package com.example.web.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AI配置（标准绑定版）
 */
@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AiConfig {

    /**
     * DeepSeek API Key
     */
    private String apiKey;

    /**
     * API地址
     */
    private String apiUrl = "https://api.deepseek.com/chat/completions";

    /**
     * 模型名称
     */
    private String model = "deepseek-chat";

    /**
     * 最大token
     */
    private Integer maxTokens = 4000;

    /**
     * 温度
     */
    private Double temperature = 0.3;

    /**
     * mock模式
     */
    private Boolean mockMode = false;

    /**
     * 超时
     */
    private Integer timeout = 10000;
}
