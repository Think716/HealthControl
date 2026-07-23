package com.example.web.dto;

import com.example.web.entity.SportUnit;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;

@Data
public class SportUnitDto {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("CreationTime")
    private LocalDateTime CreationTime;
    @JsonProperty("SportId")
    private Integer SportId;
    @JsonProperty("UnitName")
    private String UnitName;
    @JsonProperty("UnitValue")
    private Double UnitValue;
    @JsonProperty("Calories")
    private Double Calories;

    public SportUnit MapToEntity() throws InvocationTargetException, IllegalAccessException {
        SportUnit entity = new SportUnit();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
