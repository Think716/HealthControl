package com.example.web.controller;

import com.example.web.dto.CommunityCommentDto;
import com.example.web.dto.query.CommunityCommentPagedInput;
import com.example.web.service.CommunityCommentService;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/CommunityComment")
public class CommunityCommentController {
    @Autowired
    private CommunityCommentService communityCommentService;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<CommunityCommentDto> List(@RequestBody CommunityCommentPagedInput input) {
        return communityCommentService.List(input);
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    public CommunityCommentDto CreateOrEdit(@RequestBody CommunityCommentDto input) throws Exception {
        return communityCommentService.CreateOrEdit(input);
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        communityCommentService.Delete(input);
    }
}
