package com.example.web.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.web.dto.CommunityCommentDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
@TableName("`CommunityComment`")
public class CommunityComment extends BaseEntity {
    @JsonProperty("PostId")
    @TableField(value = "PostId", updateStrategy = FieldStrategy.IGNORED)
    private Integer PostId;

    @JsonProperty("CommentUserId")
    @TableField(value = "CommentUserId", updateStrategy = FieldStrategy.IGNORED)
    private Integer CommentUserId;

    @JsonProperty("Content")
    @TableField(value = "Content", updateStrategy = FieldStrategy.IGNORED)
    private String Content;

    @JsonProperty("Status")
    @TableField(value = "Status", updateStrategy = FieldStrategy.IGNORED)
    private Integer Status;

    public CommunityCommentDto MapToDto() throws InvocationTargetException, IllegalAccessException {
        CommunityCommentDto dto = new CommunityCommentDto();
        BeanUtils.copyProperties(dto, this);
        return dto;
    }
}
