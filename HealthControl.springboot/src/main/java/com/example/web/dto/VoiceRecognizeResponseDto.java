package com.example.web.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class VoiceRecognizeResponseDto {

    private String text;

    private Integer savedCount;

    private List<VoiceFoodItemDto> matchedItems = new ArrayList<>();

    private List<String> unmatchedTexts = new ArrayList<>();

}