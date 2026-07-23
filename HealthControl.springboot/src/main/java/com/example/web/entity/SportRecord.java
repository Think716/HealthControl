package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.SportRecordDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;

@Data
@TableName("`sportrecord`")
public class SportRecord extends BaseEntity {

    @JsonProperty("SportId")
    @TableField(value = "SportId", updateStrategy = FieldStrategy.IGNORED)
    private Integer SportId;

    @JsonProperty("SportUnitId")
    @TableField(value = "SportUnitId", updateStrategy = FieldStrategy.IGNORED)
    private Integer SportUnitId;

    @JsonProperty("RecordUserId")
    @TableField(value = "RecordUserId", updateStrategy = FieldStrategy.IGNORED)
    private Integer RecordUserId;

    @JsonProperty("RecordTime")
    @TableField(value = "RecordTime", updateStrategy = FieldStrategy.IGNORED)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime RecordTime;

    @JsonProperty("RecordValue")
    @TableField(value = "RecordValue", updateStrategy = FieldStrategy.IGNORED)
    private Integer RecordValue;

    public SportRecordDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        SportRecordDto dto = new SportRecordDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
