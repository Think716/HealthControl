package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.FitnessVideoDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
@TableName("`FitnessVideo`")
public class FitnessVideo extends BaseEntity {
    @JsonProperty("Title")
    @TableField(value = "Title", updateStrategy = FieldStrategy.IGNORED)
    private String Title;

    @JsonProperty("Cover")
    @TableField(value = "Cover", updateStrategy = FieldStrategy.IGNORED)
    private String Cover;

    @JsonProperty("VideoUrl")
    @TableField(value = "VideoUrl", updateStrategy = FieldStrategy.IGNORED)
    private String VideoUrl;

    @JsonProperty("BmiCategory")
    @TableField(value = "BmiCategory", updateStrategy = FieldStrategy.IGNORED)
    private String BmiCategory;

    @JsonProperty("TrainingGoal")
    @TableField(value = "TrainingGoal", updateStrategy = FieldStrategy.IGNORED)
    private String TrainingGoal;

    @JsonProperty("Level")
    @TableField(value = "Level", updateStrategy = FieldStrategy.IGNORED)
    private String Level;

    @JsonProperty("DurationMinutes")
    @TableField(value = "DurationMinutes", updateStrategy = FieldStrategy.IGNORED)
    private Integer DurationMinutes;

    @JsonProperty("Calories")
    @TableField(value = "Calories", updateStrategy = FieldStrategy.IGNORED)
    private Integer Calories;

    @JsonProperty("SortOrder")
    @TableField(value = "SortOrder", updateStrategy = FieldStrategy.IGNORED)
    private Integer SortOrder;

    @JsonProperty("Status")
    @TableField(value = "Status", updateStrategy = FieldStrategy.IGNORED)
    private Integer Status;

    @JsonProperty("Content")
    @TableField(value = "Content", updateStrategy = FieldStrategy.IGNORED)
    private String Content;

    @JsonProperty("ImageUrls")
    @TableField(value = "ImageUrls", updateStrategy = FieldStrategy.IGNORED)
    private String ImageUrls;

    public FitnessVideoDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        FitnessVideoDto dto = new FitnessVideoDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
