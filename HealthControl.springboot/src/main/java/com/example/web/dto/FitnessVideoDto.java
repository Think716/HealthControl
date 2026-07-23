package com.example.web.dto;

import com.example.web.entity.FitnessVideo;
import com.example.web.tools.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
public class FitnessVideoDto extends BaseDto {
    @JsonProperty("Title")
    private String Title;
    @JsonProperty("Cover")
    private String Cover;
    @JsonProperty("VideoUrl")
    private String VideoUrl;
    @JsonProperty("BmiCategory")
    private String BmiCategory;
    @JsonProperty("TrainingGoal")
    private String TrainingGoal;
    @JsonProperty("Level")
    private String Level;
    @JsonProperty("DurationMinutes")
    private Integer DurationMinutes;
    @JsonProperty("Calories")
    private Integer Calories;
    @JsonProperty("SortOrder")
    private Integer SortOrder;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("Content")
    private String Content;
    @JsonProperty("ImageUrls")
    private String ImageUrls;
    @JsonProperty("RecommendReason")
    private String RecommendReason;

    public FitnessVideo MapToEntity() throws InvocationTargetException, IllegalAccessException {
        FitnessVideo entity = new FitnessVideo();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
