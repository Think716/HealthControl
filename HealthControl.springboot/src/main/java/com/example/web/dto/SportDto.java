package com.example.web.dto;

import com.example.web.entity.Sport;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SportDto {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("CreationTime")
    private LocalDateTime CreationTime;
    @JsonProperty("Name")
    private String Name;
    @JsonProperty("Cover")
    private String Cover;
    @JsonProperty("Content")
    private String Content;
    @JsonProperty("SportUnits")
    private List<SportUnitDto> SportUnits = new ArrayList<>();

    public Sport MapToEntity() throws InvocationTargetException, IllegalAccessException {
        Sport entity = new Sport();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
