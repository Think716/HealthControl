package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommunityPostPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("PublishUserId")
    private Integer PublishUserId;
    @JsonProperty("UserName")
    private String UserName;
    @JsonProperty("PostType")
    private String PostType;
    @JsonProperty("Tag")
    private String Tag;
    @JsonProperty("AuditStatus")
    private Integer AuditStatus;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("CreationTimeRange")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private List<LocalDateTime> CreationTimeRange;
}
