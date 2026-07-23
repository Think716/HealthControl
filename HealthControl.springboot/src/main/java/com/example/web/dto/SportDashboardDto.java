package com.example.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SportDashboardDto {
    @JsonProperty("IntakeCalories")
    private Double IntakeCalories;
    @JsonProperty("BurnedCalories")
    private Double BurnedCalories;
    @JsonProperty("NetCalories")
    private Double NetCalories;
    @JsonProperty("RecordCount")
    private Integer RecordCount;
    @JsonProperty("IsChecked")
    private Boolean IsChecked;
    @JsonProperty("Suggestion")
    private String Suggestion;
    @JsonProperty("ContinuousDays")
    private Integer ContinuousDays;
    @JsonProperty("Points")
    private Integer Points;
    @JsonProperty("Badges")
    private List<String> Badges = new ArrayList<>();
    @JsonProperty("SportRecords")
    private List<SportRecordDto> SportRecords = new ArrayList<>();
}
