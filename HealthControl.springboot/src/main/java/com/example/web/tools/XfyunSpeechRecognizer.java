package com.example.web.tools;

import com.example.web.config.XfyunConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@Component
public class XfyunSpeechRecognizer {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private XfyunConfig config;

    public String recognize(byte[] audioData) throws Exception {

        String authUrl = getAuthUrl(
                config.getHostUrl(),
                config.getApiKey(),
                config.getApiSecret()
        );

        SpeechClient client = new SpeechClient(new URI(authUrl), config.getAppId());

        client.connectBlocking();

        client.sendAudio(audioData);

        boolean ok = client.await(15, TimeUnit.SECONDS);

        client.close();

        if (!ok) {
            throw new RuntimeException("语音识别超时");
        }

        return client.getResult();
    }

    // ===================== WebSocket Client =====================

    private static class SpeechClient extends WebSocketClient {

        private final ObjectMapper mapper = new ObjectMapper();

        private final CountDownLatch latch = new CountDownLatch(1);

        private final StringBuilder result = new StringBuilder();

        private String appId;

        private boolean error = false;
        private String errorMsg;

        private boolean firstFrame = true;

        public SpeechClient(URI uri, String appId) {
            super(uri);
            this.appId = appId;
        }

        public void sendAudio(byte[] audioData) {

            int frameSize = 1280; // ✅ 40ms PCM (16k/16bit/mono)

            for (int i = 0; i < audioData.length; i += frameSize) {

                int len = Math.min(frameSize, audioData.length - i);
                byte[] frame = Arrays.copyOfRange(audioData, i, i + len);

                ObjectNode root = mapper.createObjectNode();

                // common + business 只发一次（第一帧）
                if (firstFrame) {

                    ObjectNode common = mapper.createObjectNode();
                    common.put("app_id", appId);

                    ObjectNode business = mapper.createObjectNode();
                    business.put("language", "zh_cn");
                    business.put("domain", "iat");
                    business.put("accent", "mandarin");

                    root.set("common", common);
                    root.set("business", business);

                    ObjectNode data = mapper.createObjectNode();
                    data.put("status", 0);

                    data.put("audio", Base64.getEncoder().encodeToString(frame));
                    root.set("data", data);

                    firstFrame = false;

                } else {

                    ObjectNode data = mapper.createObjectNode();
                    data.put("status", 1);

                    data.put("audio", Base64.getEncoder().encodeToString(frame));
                    root.set("data", data);
                }

                send(root.toString());
            }

            // ===== 结束帧 =====
            ObjectNode end = mapper.createObjectNode();
            ObjectNode data = mapper.createObjectNode();

            data.put("status", 2);
            data.put("audio", "");

            end.set("data", data);

            send(end.toString());
        }

        @Override
        public void onMessage(String message) {

            try {
                JsonNode json = mapper.readTree(message);

                int code = json.path("code").asInt(0);
                if (code != 0) {
                    error = true;
                    errorMsg = "讯飞错误码：" + code;
                    latch.countDown();
                    return;
                }

                JsonNode data = json.path("data");
                JsonNode resultNode = data.path("result");

                if (resultNode.has("ws")) {

                    for (JsonNode ws : resultNode.get("ws")) {
                        for (JsonNode cw : ws.get("cw")) {
                            result.append(cw.get("w").asText());
                        }
                    }
                }

                if (data.path("status").asInt() == 2) {
                    latch.countDown();
                }

            } catch (Exception e) {
                error = true;
                errorMsg = "解析失败：" + e.getMessage();
                latch.countDown();
            }
        }

        @Override
        public void onOpen(ServerHandshake handshake) {
            System.out.println("讯飞连接成功");
        }

        @Override
        public void onError(Exception ex) {
            error = true;
            errorMsg = ex.getMessage();
            latch.countDown();
        }

        @Override
        public void onClose(int code, String reason, boolean remote) {
            System.out.println("连接关闭：" + reason);
        }

        public boolean await(long t, TimeUnit unit) throws InterruptedException {
            return latch.await(t, unit);
        }

        public String getResult() {
            if (error) {
                throw new RuntimeException(errorMsg);
            }
            return result.toString();
        }
    }

    // ===================== 鉴权 URL =====================

    private String getAuthUrl(String hostUrl, String apiKey, String apiSecret) throws Exception {

        URL url = new URL(hostUrl);

        SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
        sdf.setTimeZone(TimeZone.getTimeZone("GMT"));

        String date = sdf.format(new Date());

        StringBuilder signStr = new StringBuilder()
                .append("host: ").append(url.getHost()).append("\n")
                .append("date: ").append(date).append("\n")
                .append("GET ").append(url.getPath()).append(" HTTP/1.1");

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

        String sha = Base64.getEncoder().encodeToString(
                mac.doFinal(signStr.toString().getBytes(StandardCharsets.UTF_8))
        );

        String auth = String.format(
                "api_key=\"%s\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"%s\"",
                apiKey, sha
        );

        String authUrl = "wss://" + url.getHost() + url.getPath()
                + "?authorization=" + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8))
                + "&date=" + URLEncoder.encode(date, "UTF-8")
                + "&host=" + url.getHost();

        return authUrl;
    }
}