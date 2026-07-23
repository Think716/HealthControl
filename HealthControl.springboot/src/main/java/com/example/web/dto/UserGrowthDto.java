package com.example.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UserGrowthDto {
    @JsonProperty("CheckDays")
    private Integer CheckDays;
    @JsonProperty("ContinuousDays")
    private Integer ContinuousDays;
    @JsonProperty("MonthCheckDays")
    private Integer MonthCheckDays;
    @JsonProperty("TotalBurnedCalories")
    private Double TotalBurnedCalories;
    @JsonProperty("Points")
    private Integer Points;
    @JsonProperty("LevelName")
    private String LevelName;
    @JsonProperty("Badges")
    private List<String> Badges = new ArrayList<>();
}
