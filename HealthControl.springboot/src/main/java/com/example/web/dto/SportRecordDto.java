package com.example.web.dto;

import com.example.web.entity.SportRecord;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;

@Data
public class SportRecordDto {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("CreationTime")
    private LocalDateTime CreationTime;
    @JsonProperty("SportId")
    private Integer SportId;
    @JsonProperty("SportUnitId")
    private Integer SportUnitId;
    @JsonProperty("RecordUserId")
    private Integer RecordUserId;
    @JsonProperty("RecordTime")
    private LocalDateTime RecordTime;
    @JsonProperty("RecordValue")
    private Integer RecordValue;
    @JsonProperty("SportDto")
    private SportDto SportDto;
    @JsonProperty("SportUnitDto")
    private SportUnitDto SportUnitDto;
    @JsonProperty("CaloriesBurned")
    private Double CaloriesBurned;

    public SportRecord MapToEntity() throws InvocationTargetException, IllegalAccessException {
        SportRecord entity = new SportRecord();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
