package com.example.web.service;

import com.example.web.dto.CommunityCommentDto;
import com.example.web.dto.query.CommunityCommentPagedInput;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;

public interface CommunityCommentService {
    PagedResult<CommunityCommentDto> List(CommunityCommentPagedInput input);
    CommunityCommentDto CreateOrEdit(CommunityCommentDto input) throws Exception;
    void Delete(IdInput input);
}
