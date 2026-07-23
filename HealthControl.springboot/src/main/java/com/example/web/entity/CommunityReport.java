package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.CommunityReportDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
@TableName("`CommunityReport`")
public class CommunityReport extends BaseEntity {
    @JsonProperty("PostId")
    @TableField(value = "PostId", updateStrategy = FieldStrategy.IGNORED)
    private Integer PostId;

    @JsonProperty("ReportUserId")
    @TableField(value = "ReportUserId", updateStrategy = FieldStrategy.IGNORED)
    private Integer ReportUserId;

    @JsonProperty("Reason")
    @TableField(value = "Reason", updateStrategy = FieldStrategy.IGNORED)
    private String Reason;

    @JsonProperty("Status")
    @TableField(value = "Status", updateStrategy = FieldStrategy.IGNORED)
    private Integer Status;

    @JsonProperty("HandleReply")
    @TableField(value = "HandleReply", updateStrategy = FieldStrategy.IGNORED)
    private String HandleReply;

    public CommunityReportDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        CommunityReportDto dto = new CommunityReportDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
