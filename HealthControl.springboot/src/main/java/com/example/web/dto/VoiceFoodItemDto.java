package com.example.web.dto;

import lombok.Data;

@Data
public class VoiceFoodItemDto {

    private String foodName;

    private Integer count;

    private String unitName;

    private boolean matched;

}