package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.web.dto.CommunityTagDto;
import com.example.web.dto.query.CommunityTagPagedInput;
import com.example.web.entity.CommunityTag;
import com.example.web.mapper.CommunityTagMapper;
import com.example.web.service.CommunityTagService;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityTagServiceImpl extends ServiceImpl<CommunityTagMapper, CommunityTag> implements CommunityTagService {
    @Autowired
    private CommunityTagMapper communityTagMapper;

    @SneakyThrows
    @Override
    public PagedResult<CommunityTagDto> List(CommunityTagPagedInput input) {
        LambdaQueryWrapper<CommunityTag> query = Wrappers.<CommunityTag>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, CommunityTag::getId, input.getId())
                .like(Extension.isNotNullOrEmpty(input.getName()), CommunityTag::getName, input.getName())
                .orderByAsc(CommunityTag::getSort)
                .orderByDesc(CommunityTag::getCreationTime);
        Page<CommunityTag> page = new Page<>(input.getPage(), input.getLimit());
        IPage<CommunityTag> records = communityTagMapper.selectPage(page, query);
        List<CommunityTagDto> items = Extension.copyBeanList(records.getRecords(), CommunityTagDto.class);
        return PagedResult.GetInstance(items, communityTagMapper.selectCount(query));
    }

    @Override
    public CommunityTagDto Get(IdInput input) {
        CommunityTag entity = communityTagMapper.selectById(input.getId());
        if (entity == null) {
            throw new RuntimeException("标签不存在");
        }
        try {
            return entity.MapToDto();
        } catch (Exception e) {
            throw new RuntimeException("数据转换失败", e);
        }
    }

    @Override
    public CommunityTagDto CreateOrEdit(CommunityTagDto input) throws Exception {
        CommunityTag entity = input.MapToEntity();
        saveOrUpdate(entity);
        return entity.MapToDto();
    }

    @Override
    public void Delete(IdInput input) {
        communityTagMapper.deleteById(input.getId());
    }
}
