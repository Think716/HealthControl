package com.example.web.controller;

import com.example.web.dto.CommunityTagDto;
import com.example.web.dto.query.CommunityTagPagedInput;
import com.example.web.service.CommunityTagService;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/CommunityTag")
public class CommunityTagController {
    @Autowired
    private CommunityTagService communityTagService;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<CommunityTagDto> List(@RequestBody CommunityTagPagedInput input) {
        return communityTagService.List(input);
    }

    @RequestMapping(value = "/Get", method = RequestMethod.POST)
    public CommunityTagDto Get(@RequestBody IdInput input) {
        return communityTagService.Get(input);
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    public CommunityTagDto CreateOrEdit(@RequestBody CommunityTagDto input) throws Exception {
        return communityTagService.CreateOrEdit(input);
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        communityTagService.Delete(input);
    }
}
