package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CommunityReportPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("PostId")
    private Integer PostId;
    @JsonProperty("ReportUserId")
    private Integer ReportUserId;
    @JsonProperty("Reason")
    private String Reason;
    @JsonProperty("Status")
    private Integer Status;
}
