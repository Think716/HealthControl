package com.example.web.controller;

import com.example.web.dto.CommunityCommentDto;
import com.example.web.dto.CommunityPostDto;
import com.example.web.dto.CommunityReportDto;
import com.example.web.dto.query.CommunityPostPagedInput;
import com.example.web.service.CommunityPostService;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/CommunityPost")
public class CommunityPostController {
    @Autowired
    private CommunityPostService communityPostService;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<CommunityPostDto> List(@RequestBody CommunityPostPagedInput input) {
        return communityPostService.List(input);
    }

    @RequestMapping(value = "/Get", method = RequestMethod.POST)
    @SneakyThrows
    public CommunityPostDto Get(@RequestBody CommunityPostPagedInput input) {
        return communityPostService.Get(input);
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    public CommunityPostDto CreateOrEdit(@RequestBody CommunityPostDto input) throws Exception {
        return communityPostService.CreateOrEdit(input);
    }

    @RequestMapping(value = "/ShareDietRecord", method = RequestMethod.POST)
    public CommunityPostDto ShareDietRecord(@RequestBody HashMap<String, Object> input) throws Exception {
        return communityPostService.ShareDietRecord(input);
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        communityPostService.Delete(input);
    }

    @RequestMapping(value = "/Audit", method = RequestMethod.POST)
    public void Audit(@RequestBody CommunityPostDto input) {
        communityPostService.Audit(input);
    }

    @RequestMapping(value = "/SetStatus", method = RequestMethod.POST)
    public void SetStatus(@RequestBody CommunityPostDto input) {
        communityPostService.SetStatus(input);
    }

    @RequestMapping(value = "/ToggleLike", method = RequestMethod.POST)
    public HashMap<String, Object> ToggleLike(@RequestBody HashMap<String, Object> input) {
        return communityPostService.ToggleLike(input);
    }

    @RequestMapping(value = "/ToggleCollect", method = RequestMethod.POST)
    public HashMap<String, Object> ToggleCollect(@RequestBody HashMap<String, Object> input) {
        return communityPostService.ToggleCollect(input);
    }

    @RequestMapping(value = "/Comment", method = RequestMethod.POST)
    public CommunityCommentDto Comment(@RequestBody CommunityCommentDto input) throws Exception {
        return communityPostService.Comment(input);
    }

    @RequestMapping(value = "/Report", method = RequestMethod.POST)
    public CommunityReportDto Report(@RequestBody CommunityReportDto input) throws Exception {
        return communityPostService.Report(input);
    }

    @RequestMapping(value = "/Stats", method = RequestMethod.POST)
    public HashMap<String, Object> Stats() {
        return communityPostService.Stats();
    }
}
