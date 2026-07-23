package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.CommunityPostDto;
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
@TableName("`CommunityPost`")
public class CommunityPost extends BaseEntity {
    @JsonProperty("PublishUserId")
    @TableField(value = "PublishUserId", updateStrategy = FieldStrategy.IGNORED)
    private Integer PublishUserId;

    @JsonProperty("PostType")
    @TableField(value = "PostType", updateStrategy = FieldStrategy.IGNORED)
    private String PostType;

    @JsonProperty("Content")
    @TableField(value = "Content", updateStrategy = FieldStrategy.IGNORED)
    private String Content;

    @JsonProperty("ImageUrls")
    @TableField(value = "ImageUrls", updateStrategy = FieldStrategy.IGNORED)
    private String ImageUrls;

    @JsonProperty("Tags")
    @TableField(value = "Tags", updateStrategy = FieldStrategy.IGNORED)
    private String Tags;

    @JsonProperty("SourceType")
    @TableField(value = "SourceType", updateStrategy = FieldStrategy.IGNORED)
    private String SourceType;

    @JsonProperty("SourceId")
    @TableField(value = "SourceId", updateStrategy = FieldStrategy.IGNORED)
    private Integer SourceId;

    @JsonProperty("AiComment")
    @TableField(value = "AiComment", updateStrategy = FieldStrategy.IGNORED)
    private String AiComment;

    @JsonProperty("AuditStatus")
    @TableField(value = "AuditStatus", updateStrategy = FieldStrategy.IGNORED)
    private Integer AuditStatus;

    @JsonProperty("AuditReply")
    @TableField(value = "AuditReply", updateStrategy = FieldStrategy.IGNORED)
    private String AuditReply;

    @JsonProperty("AuditUserId")
    @TableField(value = "AuditUserId", updateStrategy = FieldStrategy.IGNORED)
    private Integer AuditUserId;

    @JsonProperty("AuditTime")
    @TableField(value = "AuditTime", updateStrategy = FieldStrategy.IGNORED)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime AuditTime;

    @JsonProperty("Status")
    @TableField(value = "Status", updateStrategy = FieldStrategy.IGNORED)
    private Integer Status;

    @JsonProperty("LikeCount")
    @TableField(value = "LikeCount", updateStrategy = FieldStrategy.IGNORED)
    private Integer LikeCount;

    @JsonProperty("CommentCount")
    @TableField(value = "CommentCount", updateStrategy = FieldStrategy.IGNORED)
    private Integer CommentCount;

    @JsonProperty("CollectCount")
    @TableField(value = "CollectCount", updateStrategy = FieldStrategy.IGNORED)
    private Integer CollectCount;

    public CommunityPostDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        CommunityPostDto dto = new CommunityPostDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
