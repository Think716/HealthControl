package com.example.web.service;

import com.example.web.dto.CommunityTagDto;
import com.example.web.dto.query.CommunityTagPagedInput;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;

public interface CommunityTagService {
    PagedResult<CommunityTagDto> List(CommunityTagPagedInput input);
    CommunityTagDto Get(IdInput input);
    CommunityTagDto CreateOrEdit(CommunityTagDto input) throws Exception;
    void Delete(IdInput input);
}
