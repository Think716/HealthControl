package com.example.web.service;

import com.example.web.dto.CommunityReportDto;
import com.example.web.dto.query.CommunityReportPagedInput;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;

public interface CommunityReportService {
    PagedResult<CommunityReportDto> List(CommunityReportPagedInput input);
    CommunityReportDto CreateOrEdit(CommunityReportDto input) throws Exception;
    void Delete(IdInput input);
}
