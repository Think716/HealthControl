package com.example.web.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "xfyun")
public class XfyunConfig {

    private String appId = "77904f06";
    private String apiKey = "2fe484a48a33e3b0568433ae092c8a33";
    private String apiSecret = "NTAxYTE0YjE0MTAwN2EyZjQ3NzUxY2E4";

    // 语音听写接口地址（中文普通话）
    private String hostUrl = "wss://iat-api.xfyun.cn/v2/iat";

    // getters and setters
    public String getAppId() { return appId; }
    public void setAppId(String appId) { this.appId = appId; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getApiSecret() { return apiSecret; }
    public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }

    public String getHostUrl() { return hostUrl; }
    public void setHostUrl(String hostUrl) { this.hostUrl = hostUrl; }
}