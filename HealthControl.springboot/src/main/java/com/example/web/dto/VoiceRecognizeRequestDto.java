package com.example.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 语音识别文本入参
 */
@Data
public class VoiceRecognizeRequestDto {

    @JsonProperty("Text")
    private String Text;

    @JsonProperty("UserId")
    private Integer UserId;

    @JsonProperty("RecordTime")
    private String RecordTime;
}