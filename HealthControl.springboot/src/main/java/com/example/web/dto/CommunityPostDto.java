package com.example.web.dto;

import com.example.web.entity.CommunityPost;
import com.example.web.tools.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommunityPostDto extends BaseDto {
    @JsonProperty("PublishUserId")
    private Integer PublishUserId;
    @JsonProperty("PostType")
    private String PostType;
    @JsonProperty("Content")
    private String Content;
    @JsonProperty("ImageUrls")
    private String ImageUrls;
    @JsonProperty("Tags")
    private String Tags;
    @JsonProperty("SourceType")
    private String SourceType;
    @JsonProperty("SourceId")
    private Integer SourceId;
    @JsonProperty("AiComment")
    private String AiComment;
    @JsonProperty("AuditStatus")
    private Integer AuditStatus;
    @JsonProperty("AuditReply")
    private String AuditReply;
    @JsonProperty("AuditUserId")
    private Integer AuditUserId;
    @JsonProperty("AuditTime")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime AuditTime;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("LikeCount")
    private Integer LikeCount;
    @JsonProperty("CommentCount")
    private Integer CommentCount;
    @JsonProperty("CollectCount")
    private Integer CollectCount;
    @JsonProperty("PublishUserDto")
    private AppUserDto PublishUserDto;
    @JsonProperty("Comments")
    private List<CommunityCommentDto> Comments;
    @JsonProperty("Liked")
    private Boolean Liked;
    @JsonProperty("Collected")
    private Boolean Collected;

    public CommunityPost MapToEntity() throws InvocationTargetException, IllegalAccessException {
        CommunityPost entity = new CommunityPost();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
