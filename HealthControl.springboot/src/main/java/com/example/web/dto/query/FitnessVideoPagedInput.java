package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FitnessVideoPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("Title")
    private String Title;
    @JsonProperty("BmiCategory")
    private String BmiCategory;
    @JsonProperty("TrainingGoal")
    private String TrainingGoal;
    @JsonProperty("Level")
    private String Level;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("UserId")
    private Integer UserId;
    @JsonProperty("BMI")
    private Double BMI;
}
