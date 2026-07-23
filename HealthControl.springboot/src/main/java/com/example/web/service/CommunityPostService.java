package com.example.web.service;

import com.example.web.dto.CommunityCommentDto;
import com.example.web.dto.CommunityPostDto;
import com.example.web.dto.CommunityReportDto;
import com.example.web.dto.query.CommunityPostPagedInput;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;

import java.util.HashMap;

public interface CommunityPostService {
    PagedResult<CommunityPostDto> List(CommunityPostPagedInput input);
    CommunityPostDto Get(CommunityPostPagedInput input);
    CommunityPostDto CreateOrEdit(CommunityPostDto input) throws Exception;
    CommunityPostDto ShareDietRecord(HashMap<String, Object> input) throws Exception;
    void Delete(IdInput input);
    void Audit(CommunityPostDto input);
    void SetStatus(CommunityPostDto input);
    HashMap<String, Object> ToggleLike(HashMap<String, Object> input);
    HashMap<String, Object> ToggleCollect(HashMap<String, Object> input);
    CommunityCommentDto Comment(CommunityCommentDto input) throws Exception;
    CommunityReportDto Report(CommunityReportDto input) throws Exception;
    HashMap<String, Object> Stats();
}
