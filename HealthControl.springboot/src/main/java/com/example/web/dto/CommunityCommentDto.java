package com.example.web.dto;

import com.example.web.entity.CommunityComment;
import com.example.web.tools.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

@Data
public class CommunityCommentDto extends BaseDto {
    @JsonProperty("PostId")
    private Integer PostId;
    @JsonProperty("CommentUserId")
    private Integer CommentUserId;
    @JsonProperty("Content")
    private String Content;
    @JsonProperty("Status")
    private Integer Status;
    @JsonProperty("CommentUserDto")
    private AppUserDto CommentUserDto;

    public CommunityComment MapToEntity() throws InvocationTargetException, IllegalAccessException {
        CommunityComment entity = new CommunityComment();
        BeanUtils.copyProperties(entity, this);
        return entity;
    }
}
