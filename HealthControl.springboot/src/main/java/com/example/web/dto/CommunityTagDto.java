package com.example.web.dto;

import com.example.web.entity.CommunityTag;
import com.example.web.tools.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
public class CommunityTagDto extends BaseDto {
    @JsonProperty("Name")
    private String Name;
    @JsonProperty("Sort")
    private Integer Sort;

    public CommunityTag MapToEntity() throws InvocationTargetException, IllegalAccessException {
        CommunityTag entity = new CommunityTag();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
