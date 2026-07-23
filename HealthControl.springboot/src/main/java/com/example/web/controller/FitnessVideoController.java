package com.example.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.web.dto.FitnessVideoDto;
import com.example.web.dto.query.FitnessVideoPagedInput;
import com.example.web.entity.FitnessVideo;
import com.example.web.entity.HealthIndicator;
import com.example.web.entity.HealthIndicatorRecord;
import com.example.web.mapper.FitnessVideoMapper;
import com.example.web.mapper.HealthIndicatorMapper;
import com.example.web.mapper.HealthIndicatorRecordMapper;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.IdsInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/FitnessVideo")
public class FitnessVideoController {
    @Autowired
    private FitnessVideoMapper fitnessVideoMapper;
    @Autowired
    private HealthIndicatorMapper healthIndicatorMapper;
    @Autowired
    private HealthIndicatorRecordMapper healthIndicatorRecordMapper;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<FitnessVideoDto> List(@RequestBody FitnessVideoPagedInput input) {
        LambdaQueryWrapper<FitnessVideo> query = buildQuery(input)
                .orderByDesc(FitnessVideo::getStatus)
                .orderByAsc(FitnessVideo::getSortOrder)
                .orderByDesc(FitnessVideo::getCreationTime);
        Page<FitnessVideo> page = new Page<>(input.getPage(), input.getLimit());
        IPage<FitnessVideo> records = fitnessVideoMapper.selectPage(page, query);
        List<FitnessVideoDto> items = Extension.copyBeanList(records.getRecords(), FitnessVideoDto.class);
        return PagedResult.GetInstance(items, fitnessVideoMapper.selectCount(query));
    }

    @RequestMapping(value = "/Get", method = RequestMethod.POST)
    @SneakyThrows
    public FitnessVideoDto Get(@RequestBody FitnessVideoPagedInput input) {
        if (input.getId() == null) return new FitnessVideoDto();
        return List(input).getItems().stream().findFirst().orElse(new FitnessVideoDto());
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    public FitnessVideoDto CreateOrEdit(@RequestBody FitnessVideoDto input) throws Exception {
        FitnessVideo entity = input.MapToEntity();
        if (entity.getStatus() == null) entity.setStatus(1);
        if (entity.getSortOrder() == null) entity.setSortOrder(100);
        if (entity.getId() == null || entity.getId() == 0) {
            fitnessVideoMapper.insert(entity);
        } else {
            fitnessVideoMapper.updateById(entity);
        }
        return entity.MapToDto();
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        fitnessVideoMapper.deleteById(input.getId());
    }

    @RequestMapping(value = "/BatchDelete", method = RequestMethod.POST)
    public void BatchDelete(@RequestBody IdsInput input) {
        fitnessVideoMapper.deleteBatchIds(input.getIds());
    }

    @RequestMapping(value = "/RecommendList", method = RequestMethod.POST)
    @SneakyThrows
    public List<FitnessVideoDto> RecommendList(@RequestBody FitnessVideoPagedInput input) {
        Double bmi = input.getBMI() != null ? input.getBMI() : getLatestBmi(input.getUserId());
        String category = getBmiCategory(bmi);
        LambdaQueryWrapper<FitnessVideo> query = Wrappers.<FitnessVideo>lambdaQuery()
                .eq(FitnessVideo::getStatus, 1)
                .and(q -> q.eq(FitnessVideo::getBmiCategory, category).or().eq(FitnessVideo::getBmiCategory, "通用"))
                .orderByAsc(FitnessVideo::getSortOrder)
                .orderByDesc(FitnessVideo::getCreationTime)
                .last("LIMIT " + Math.max(1, input.getLimit()));
        List<FitnessVideoDto> items = Extension.copyBeanList(fitnessVideoMapper.selectList(query), FitnessVideoDto.class);
        for (FitnessVideoDto item : items) {
            item.setRecommendReason(buildReason(category, bmi, item.getTrainingGoal()));
        }
        return items;
    }

    @RequestMapping(value = "/BmiProfile", method = RequestMethod.POST)
    public java.util.HashMap<String, Object> BmiProfile(@RequestBody FitnessVideoPagedInput input) {
        Double bmi = input.getBMI() != null ? input.getBMI() : getLatestBmi(input.getUserId());
        String category = getBmiCategory(bmi);
        java.util.HashMap<String, Object> data = new java.util.HashMap<>();
        data.put("BMI", bmi);
        data.put("BmiCategory", category);
        data.put("HealthLayer", getHealthLayer(category));
        data.put("Recommendation", getPersonalRecommendation(category));
        return data;
    }

    private LambdaQueryWrapper<FitnessVideo> buildQuery(FitnessVideoPagedInput input) {
        LambdaQueryWrapper<FitnessVideo> query = Wrappers.<FitnessVideo>lambdaQuery();
        query.eq(input.getId() != null && input.getId() != 0, FitnessVideo::getId, input.getId());
        query.like(Extension.isNotNullOrEmpty(input.getTitle()), FitnessVideo::getTitle, input.getTitle());
        query.eq(Extension.isNotNullOrEmpty(input.getBmiCategory()), FitnessVideo::getBmiCategory, input.getBmiCategory());
        query.eq(Extension.isNotNullOrEmpty(input.getTrainingGoal()), FitnessVideo::getTrainingGoal, input.getTrainingGoal());
        query.eq(Extension.isNotNullOrEmpty(input.getLevel()), FitnessVideo::getLevel, input.getLevel());
        query.eq(input.getStatus() != null, FitnessVideo::getStatus, input.getStatus());
        return query;
    }

    private Double getLatestBmi(Integer userId) {
        if (userId == null) return null;
        List<Integer> ids = healthIndicatorMapper.selectList(Wrappers.<HealthIndicator>lambdaQuery()
                        .like(HealthIndicator::getName, "BMI")
                        .or()
                        .like(HealthIndicator::getName, "体质指数"))
                .stream().map(HealthIndicator::getId).toList();
        if (ids.isEmpty()) return null;
        HealthIndicatorRecord record = healthIndicatorRecordMapper.selectOne(Wrappers.<HealthIndicatorRecord>lambdaQuery()
                .eq(HealthIndicatorRecord::getRecordUserId, userId)
                .in(HealthIndicatorRecord::getHealthIndicatorId, ids)
                .orderByDesc(HealthIndicatorRecord::getRecordTime)
                .last("LIMIT 1"));
        return record == null ? null : record.getRecordValue();
    }

    private String getBmiCategory(Double bmi) {
        if (bmi == null || bmi <= 0) return "通用";
        if (bmi < 18.5) return "偏瘦";
        if (bmi < 24) return "正常";
        if (bmi < 28) return "超重";
        return "肥胖";
    }

    private String buildReason(String category, Double bmi, String goal) {
        String bmiText = bmi == null ? "暂无BMI记录" : "BMI " + Extension.ToFixed4(bmi);
        return bmiText + "，健康分层为" + category + "，优先推荐" + (goal == null ? "循序渐进训练" : goal) + "课程。";
    }

    private String getHealthLayer(String category) {
        return switch (category) {
            case "偏瘦" -> "增肌增重关注人群";
            case "正常" -> "健康维持人群";
            case "超重" -> "体重管理人群";
            case "肥胖" -> "重点减脂干预人群";
            default -> "待完善健康数据人群";
        };
    }

    private String getPersonalRecommendation(String category) {
        return switch (category) {
            case "偏瘦" -> "建议优先进行基础力量训练，搭配足量蛋白质和主食摄入。";
            case "正常" -> "建议保持有氧与力量结合，每周稳定训练3-5次。";
            case "超重" -> "建议从低冲击有氧开始，逐步增加力量训练，提高代谢水平。";
            case "肥胖" -> "建议选择低冲击、可持续训练，控制强度并关注关节保护。";
            default -> "请先完善身高、体重和BMI记录，系统会自动生成分层推荐。";
        };
    }
}
