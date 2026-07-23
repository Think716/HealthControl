package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.web.dto.AppUserDto;
import com.example.web.dto.CommunityPostDto;
import com.example.web.dto.CommunityReportDto;
import com.example.web.dto.query.CommunityReportPagedInput;
import com.example.web.entity.AppUser;
import com.example.web.entity.CommunityPost;
import com.example.web.entity.CommunityReport;
import com.example.web.mapper.AppUserMapper;
import com.example.web.mapper.CommunityPostMapper;
import com.example.web.mapper.CommunityReportMapper;
import com.example.web.service.CommunityReportService;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityReportServiceImpl extends ServiceImpl<CommunityReportMapper, CommunityReport> implements CommunityReportService {
    @Autowired
    private CommunityReportMapper communityReportMapper;
    @Autowired
    private CommunityPostMapper communityPostMapper;
    @Autowired
    private AppUserMapper appUserMapper;

    @SneakyThrows
    @Override
    public PagedResult<CommunityReportDto> List(CommunityReportPagedInput input) {
        LambdaQueryWrapper<CommunityReport> query = Wrappers.<CommunityReport>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, CommunityReport::getId, input.getId())
                .eq(input.getPostId() != null, CommunityReport::getPostId, input.getPostId())
                .eq(input.getReportUserId() != null, CommunityReport::getReportUserId, input.getReportUserId())
                .eq(input.getStatus() != null, CommunityReport::getStatus, input.getStatus())
                .like(Extension.isNotNullOrEmpty(input.getReason()), CommunityReport::getReason, input.getReason())
                .like(Extension.isNotNullOrEmpty(input.getKeyWord()), CommunityReport::getReason, input.getKeyWord())
                .orderByDesc(CommunityReport::getCreationTime);
        Page<CommunityReport> page = new Page<>(input.getPage(), input.getLimit());
        IPage<CommunityReport> records = communityReportMapper.selectPage(page, query);
        List<CommunityReportDto> items = Extension.copyBeanList(records.getRecords(), CommunityReportDto.class);
        for (CommunityReportDto item : items) {
            AppUser user = appUserMapper.selectById(item.getReportUserId());
            item.setReportUserDto(user == null ? new AppUserDto() : user.MapToDto());
            CommunityPost post = communityPostMapper.selectById(item.getPostId());
            item.setPostDto(post == null ? new CommunityPostDto() : post.MapToDto());
        }
        return PagedResult.GetInstance(items, communityReportMapper.selectCount(query));
    }

    @Override
    public CommunityReportDto CreateOrEdit(CommunityReportDto input) throws Exception {
        CommunityReport entity = input.MapToEntity();
        if (entity.getStatus() == null) entity.setStatus(1);
        saveOrUpdate(entity);
        return entity.MapToDto();
    }

    @Override
    public void Delete(IdInput input) {
        communityReportMapper.deleteById(input.getId());
    }
}
