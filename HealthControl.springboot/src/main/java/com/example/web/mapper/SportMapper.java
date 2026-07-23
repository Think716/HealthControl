package com.example.web.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.web.entity.Sport;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SportMapper extends BaseMapper<Sport> {
}
