package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.web.dto.AppUserDto;
import com.example.web.dto.CommunityCommentDto;
import com.example.web.dto.query.CommunityCommentPagedInput;
import com.example.web.entity.AppUser;
import com.example.web.entity.CommunityComment;
import com.example.web.entity.CommunityPost;
import com.example.web.mapper.AppUserMapper;
import com.example.web.mapper.CommunityCommentMapper;
import com.example.web.mapper.CommunityPostMapper;
import com.example.web.service.CommunityCommentService;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityCommentServiceImpl extends ServiceImpl<CommunityCommentMapper, CommunityComment> implements CommunityCommentService {
    @Autowired
    private CommunityCommentMapper communityCommentMapper;
    @Autowired
    private AppUserMapper appUserMapper;
    @Autowired
    private CommunityPostMapper communityPostMapper;

    @SneakyThrows
    @Override
    public PagedResult<CommunityCommentDto> List(CommunityCommentPagedInput input) {
        LambdaQueryWrapper<CommunityComment> query = Wrappers.<CommunityComment>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, CommunityComment::getId, input.getId())
                .eq(input.getPostId() != null, CommunityComment::getPostId, input.getPostId())
                .eq(input.getCommentUserId() != null, CommunityComment::getCommentUserId, input.getCommentUserId())
                .like(Extension.isNotNullOrEmpty(input.getContent()), CommunityComment::getContent, input.getContent())
                .like(Extension.isNotNullOrEmpty(input.getKeyWord()), CommunityComment::getContent, input.getKeyWord())
                .orderByDesc(CommunityComment::getCreationTime);
        Page<CommunityComment> page = new Page<>(input.getPage(), input.getLimit());
        IPage<CommunityComment> records = communityCommentMapper.selectPage(page, query);
        List<CommunityCommentDto> items = Extension.copyBeanList(records.getRecords(), CommunityCommentDto.class);
        for (CommunityCommentDto item : items) {
            AppUser user = appUserMapper.selectById(item.getCommentUserId());
            item.setCommentUserDto(user == null ? new AppUserDto() : user.MapToDto());
        }
        return PagedResult.GetInstance(items, communityCommentMapper.selectCount(query));
    }

    @Override
    public CommunityCommentDto CreateOrEdit(CommunityCommentDto input) throws Exception {
        CommunityComment entity = input.MapToEntity();
        if (entity.getStatus() == null) entity.setStatus(1);
        saveOrUpdate(entity);
        return entity.MapToDto();
    }

    @Override
    public void Delete(IdInput input) {
        CommunityComment comment = communityCommentMapper.selectById(input.getId());
        communityCommentMapper.deleteById(input.getId());
        if (comment != null && comment.getPostId() != null) {
            CommunityPost post = communityPostMapper.selectById(comment.getPostId());
            if (post != null) {
                post.setCommentCount(communityCommentMapper.selectCount(Wrappers.<CommunityComment>lambdaQuery()
                        .eq(CommunityComment::getPostId, comment.getPostId())
                        .eq(CommunityComment::getStatus, 1)).intValue());
                communityPostMapper.updateById(post);
            }
        }
    }
}
