package com.example.web.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.util.Map;

@Slf4j
public class HttpUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    // ====== 全局复用 HttpClient（重点优化）======
    private static final CloseableHttpClient httpClient;

    static {
        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(5000)
                .setSocketTimeout(10000)
                .setConnectionRequestTimeout(5000)
                .build();

        httpClient = HttpClients.custom()
                .setDefaultRequestConfig(config)
                .build();
    }

    /**
     * POST请求（优化版）
     */
    public static String Post(String url, Object bodyData, Map<String, String> headerMap) {
        HttpPost httpPost = new HttpPost(url);

        try {
            String json = mapper.writeValueAsString(bodyData);
            StringEntity entity = new StringEntity(json, "UTF-8");

            httpPost.setEntity(entity);
            httpPost.setHeader("Content-Type", "application/json");

            if (headerMap != null) {
                headerMap.forEach(httpPost::addHeader);
            }

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {

                int statusCode = response.getStatusLine().getStatusCode();
                String result = EntityUtils.toString(response.getEntity(), "UTF-8");

                if (statusCode != 200) {
                    log.error("HTTP POST失败, status={}, url={}, body={}",
                            statusCode, url, result);
                    return null;
                }

                log.info("HTTP POST成功, url={}", url);
                return result;
            }

        } catch (Exception e) {
            log.error("HTTP POST异常, url={}", url, e);
            return null;
        }
    }

    /**
     * GET请求（优化版）
     */
    public static String Get(String url, Map<String, String> headerMap) {
        HttpGet httpGet = new HttpGet(url);

        try {
            if (headerMap != null) {
                headerMap.forEach(httpGet::addHeader);
            }

            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {

                int statusCode = response.getStatusLine().getStatusCode();
                String result = EntityUtils.toString(response.getEntity(), "UTF-8");

                if (statusCode != 200) {
                    log.error("HTTP GET失败, status={}, url={}", statusCode, url);
                    return null;
                }

                return result;
            }

        } catch (Exception e) {
            log.error("HTTP GET异常, url={}", url, e);
            return null;
        }
    }
}
