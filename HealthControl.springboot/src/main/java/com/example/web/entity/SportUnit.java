package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.SportUnitDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
@TableName("`sportunit`")
public class SportUnit extends BaseEntity {

    @JsonProperty("SportId")
    @TableField(value = "SportId", updateStrategy = FieldStrategy.IGNORED)
    private Integer SportId;

    @JsonProperty("UnitName")
    @TableField(value = "UnitName", updateStrategy = FieldStrategy.IGNORED)
    private String UnitName;

    @JsonProperty("UnitValue")
    @TableField(value = "UnitValue", updateStrategy = FieldStrategy.IGNORED)
    private Double UnitValue;

    @JsonProperty("Calories")
    @TableField(value = "Calories", updateStrategy = FieldStrategy.IGNORED)
    private Double Calories;

    public SportUnitDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        SportUnitDto dto = new SportUnitDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
