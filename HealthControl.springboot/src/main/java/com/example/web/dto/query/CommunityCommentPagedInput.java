package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CommunityCommentPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("PostId")
    private Integer PostId;
    @JsonProperty("CommentUserId")
    private Integer CommentUserId;
    @JsonProperty("Content")
    private String Content;
}
