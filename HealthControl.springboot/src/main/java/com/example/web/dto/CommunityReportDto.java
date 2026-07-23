package com.example.web.dto;

import com.example.web.entity.CommunityReport;
import com.example.web.tools.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
public class CommunityReportDto extends BaseDto {
    @JsonProperty("PostId")
    private Integer PostId;
    @JsonProperty("ReportUserId")
    private Integer ReportUserId;
    @JsonProperty("Reason")
    private String Reason;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("HandleReply")
    private String HandleReply;
    @JsonProperty("ReportUserDto")
    private AppUserDto ReportUserDto;
    @JsonProperty("PostDto")
    private CommunityPostDto PostDto;

    public CommunityReport MapToEntity() throws InvocationTargetException, IllegalAccessException {
        CommunityReport entity = new CommunityReport();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
