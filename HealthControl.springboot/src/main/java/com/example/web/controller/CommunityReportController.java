package com.example.web.controller;

import com.example.web.dto.CommunityReportDto;
import com.example.web.dto.query.CommunityReportPagedInput;
import com.example.web.service.CommunityReportService;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/CommunityReport")
public class CommunityReportController {
    @Autowired
    private CommunityReportService communityReportService;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<CommunityReportDto> List(@RequestBody CommunityReportPagedInput input) {
        return communityReportService.List(input);
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    public CommunityReportDto CreateOrEdit(@RequestBody CommunityReportDto input) throws Exception {
        return communityReportService.CreateOrEdit(input);
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        communityReportService.Delete(input);
    }
}
