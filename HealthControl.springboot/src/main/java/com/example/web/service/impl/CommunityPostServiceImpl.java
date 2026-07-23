package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.web.dto.*;
import com.example.web.dto.query.CommunityPostPagedInput;
import com.example.web.entity.*;
import com.example.web.mapper.*;
import com.example.web.service.CommunityPostService;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityPostServiceImpl extends ServiceImpl<CommunityPostMapper, CommunityPost> implements CommunityPostService {
    private static final String INTERACTION_TYPE = "健康动态";

    @Autowired
    private CommunityPostMapper communityPostMapper;
    @Autowired
    private CommunityCommentMapper communityCommentMapper;
    @Autowired
    private CommunityReportMapper communityReportMapper;
    @Autowired
    private AppUserMapper appUserMapper;
    @Autowired
    private LikeRecordMapper likeRecordMapper;
    @Autowired
    private CollectRecordMapper collectRecordMapper;
    @Autowired
    private DietRecordMapper dietRecordMapper;
    @Autowired
    private FoodMapper foodMapper;
    @Autowired
    private FoodUnitMapper foodUnitMapper;

    private LambdaQueryWrapper<CommunityPost> buildQuery(CommunityPostPagedInput input) {
        LambdaQueryWrapper<CommunityPost> query = Wrappers.<CommunityPost>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, CommunityPost::getId, input.getId())
                .eq(input.getPublishUserId() != null, CommunityPost::getPublishUserId, input.getPublishUserId())
                .eq(input.getAuditStatus() != null, CommunityPost::getAuditStatus, input.getAuditStatus())
                .eq(input.getStatus() != null, CommunityPost::getStatus, input.getStatus())
                .like(Extension.isNotNullOrEmpty(input.getPostType()), CommunityPost::getPostType, input.getPostType())
                .like(Extension.isNotNullOrEmpty(input.getTag()), CommunityPost::getTags, input.getTag());
        if (Extension.isNotNullOrEmpty(input.getKeyWord())) {
            query.and(i -> i.like(CommunityPost::getContent, input.getKeyWord()).or()
                    .like(CommunityPost::getTags, input.getKeyWord()).or()
                    .like(CommunityPost::getPostType, input.getKeyWord()));
        }
        if (Extension.isNotNullOrEmpty(input.getUserName())) {
            List<Integer> userIds = appUserMapper.selectList(Wrappers.<AppUser>lambdaQuery()
                    .like(AppUser::getUserName, input.getUserName()).or()
                    .like(AppUser::getName, input.getUserName()))
                    .stream()
                    .map(AppUser::getId)
                    .collect(Collectors.toList());
            if (userIds.isEmpty()) {
                query.eq(CommunityPost::getPublishUserId, -1);
            } else {
                query.in(CommunityPost::getPublishUserId, userIds);
            }
        }
        if (input.getCreationTimeRange() != null && input.getCreationTimeRange().size() >= 2) {
            query.ge(CommunityPost::getCreationTime, input.getCreationTimeRange().get(0));
            query.le(CommunityPost::getCreationTime, input.getCreationTimeRange().get(1));
        }
        return query;
    }

    private void dispatch(List<CommunityPostDto> items) throws InvocationTargetException, IllegalAccessException {
        for (CommunityPostDto item : items) {
            AppUser user = appUserMapper.selectById(item.getPublishUserId());
            item.setPublishUserDto(user == null ? new AppUserDto() : user.MapToDto());
            List<CommunityComment> comments = communityCommentMapper.selectList(Wrappers.<CommunityComment>lambdaQuery()
                    .eq(CommunityComment::getPostId, item.getId())
                    .eq(CommunityComment::getStatus, 1)
                    .orderByAsc(CommunityComment::getCreationTime)
                    .last("LIMIT 5"));
            List<CommunityCommentDto> commentDtos = Extension.copyBeanList(comments, CommunityCommentDto.class);
            for (CommunityCommentDto commentDto : commentDtos) {
                AppUser commentUser = appUserMapper.selectById(commentDto.getCommentUserId());
                commentDto.setCommentUserDto(commentUser == null ? new AppUserDto() : commentUser.MapToDto());
            }
            item.setComments(commentDtos);
        }
    }

    @SneakyThrows
    @Override
    public PagedResult<CommunityPostDto> List(CommunityPostPagedInput input) {
        LambdaQueryWrapper<CommunityPost> query = buildQuery(input).orderByDesc(CommunityPost::getCreationTime);
        Page<CommunityPost> page = new Page<>(input.getPage(), input.getLimit());
        IPage<CommunityPost> records = communityPostMapper.selectPage(page, query);
        List<CommunityPostDto> items = Extension.copyBeanList(records.getRecords(), CommunityPostDto.class);
        dispatch(items);
        return PagedResult.GetInstance(items, communityPostMapper.selectCount(query));
    }

    @SneakyThrows
    @Override
    public CommunityPostDto Get(CommunityPostPagedInput input) {
        if (input.getId() == null) return new CommunityPostDto();
        CommunityPostDto dto = List(input).getItems().stream().findFirst().orElse(new CommunityPostDto());
        if (dto.getId() != null) {
            dto.setLikeCount(countLikes(dto.getId()));
            dto.setCollectCount(countCollects(dto.getId()));
            dto.setCommentCount(countComments(dto.getId()));
        }
        return dto;
    }

    @Override
    public CommunityPostDto CreateOrEdit(CommunityPostDto input) throws Exception {
        CommunityPost entity = input.MapToEntity();
        if (entity.getAuditStatus() == null) entity.setAuditStatus(1);
        if (entity.getStatus() == null) entity.setStatus(1);
        if (entity.getLikeCount() == null) entity.setLikeCount(0);
        if (entity.getCommentCount() == null) entity.setCommentCount(0);
        if (entity.getCollectCount() == null) entity.setCollectCount(0);
        entity.setAiComment(buildAiComment(entity.getContent()));
        saveOrUpdate(entity);
        return entity.MapToDto();
    }

    @Override
    public CommunityPostDto ShareDietRecord(HashMap<String, Object> input) throws Exception {
        Integer userId = toInt(input.get("UserId"));
        String mealName = Objects.toString(input.getOrDefault("MealName", "早餐"), "早餐");
        LocalDate date = LocalDate.now();
        if (input.get("Date") != null) {
            date = LocalDate.parse(input.get("Date").toString().substring(0, 10));
        }
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        List<DietRecord> records = dietRecordMapper.selectList(Wrappers.<DietRecord>lambdaQuery()
                .eq(DietRecord::getRecordUserId, userId)
                .ge(DietRecord::getRecordTime, start)
                .lt(DietRecord::getRecordTime, end));
        StringBuilder content = new StringBuilder("今日").append(mealName).append("：");
        double calories = 0;
        for (DietRecord record : records) {
            Food food = foodMapper.selectById(record.getFoodId());
            FoodUnit unit = foodUnitMapper.selectById(record.getFoodUnitId());
            if (food == null) continue;
            int count = record.getRecordValue() == null ? 1 : record.getRecordValue();
            content.append(food.getName()).append("×").append(count);
            if (unit != null && unit.getUnitName() != null) content.append(unit.getUnitName());
            content.append(" ");
            double unitValue = unit == null || unit.getUnitValue() == null ? 1 : unit.getUnitValue();
            calories += safe(food.getCalories()) * unitValue * count;
        }
        content.append("热量：").append(Math.round(calories)).append("kcal");
        CommunityPostDto dto = new CommunityPostDto();
        dto.setPublishUserId(userId);
        dto.setPostType("健康饮食分享");
        String tag = "#健康早餐";
        if (mealName.contains("午餐") || mealName.contains("中餐")) tag = "#健康午餐";
        else if (mealName.contains("晚餐")) tag = "#健康晚餐";
        else if (mealName.contains("加餐") || mealName.contains("零食")) tag = "#健康加餐";
        dto.setTags(tag);
        dto.setSourceType("饮食记录");
        dto.setContent(content.toString());
        return CreateOrEdit(dto);
    }

    @Override
    public void Delete(IdInput input) {
        communityPostMapper.deleteById(input.getId());
    }

    @Override
    public void Audit(CommunityPostDto input) {
        CommunityPost entity = communityPostMapper.selectById(input.getId());
        entity.setAuditStatus(input.getAuditStatus());
        entity.setAuditReply(input.getAuditReply());
        entity.setAuditUserId(input.getAuditUserId());
        entity.setAuditTime(LocalDateTime.now());
        communityPostMapper.updateById(entity);
    }

    @Override
    public void SetStatus(CommunityPostDto input) {
        CommunityPost entity = communityPostMapper.selectById(input.getId());
        entity.setStatus(input.getStatus());
        communityPostMapper.updateById(entity);
    }

    @Override
    public HashMap<String, Object> ToggleLike(HashMap<String, Object> input) {
        Integer userId = toInt(input.get("UserId"));
        Integer postId = toInt(input.get("PostId"));
        LambdaQueryWrapper<LikeRecord> query = Wrappers.<LikeRecord>lambdaQuery()
                .eq(LikeRecord::getLikeUserId, userId)
                .eq(LikeRecord::getLikeType, INTERACTION_TYPE)
                .eq(LikeRecord::getRelativeId, String.valueOf(postId));
        LikeRecord record = likeRecordMapper.selectOne(query);
        boolean liked = record == null;
        if (liked) {
            record = new LikeRecord();
            record.setLikeUserId(userId);
            record.setLikeType(INTERACTION_TYPE);
            record.setRelativeId(String.valueOf(postId));
            likeRecordMapper.insert(record);
        } else {
            likeRecordMapper.deleteById(record.getId());
        }
        syncCounts(postId);
        return state("Liked", liked, postId);
    }

    @Override
    public HashMap<String, Object> ToggleCollect(HashMap<String, Object> input) {
        Integer userId = toInt(input.get("UserId"));
        Integer postId = toInt(input.get("PostId"));
        LambdaQueryWrapper<CollectRecord> query = Wrappers.<CollectRecord>lambdaQuery()
                .eq(CollectRecord::getCollectUserId, userId)
                .eq(CollectRecord::getCollectType, INTERACTION_TYPE)
                .eq(CollectRecord::getRelativeId, postId);
        CollectRecord record = collectRecordMapper.selectOne(query);
        boolean collected = record == null;
        if (collected) {
            record = new CollectRecord();
            record.setCollectUserId(userId);
            record.setCollectType(INTERACTION_TYPE);
            record.setRelativeId(postId);
            collectRecordMapper.insert(record);
        } else {
            collectRecordMapper.deleteById(record.getId());
        }
        syncCounts(postId);
        return state("Collected", collected, postId);
    }

    @Override
    public CommunityCommentDto Comment(CommunityCommentDto input) throws Exception {
        CommunityComment comment = input.MapToEntity();
        if (comment.getStatus() == null) comment.setStatus(1);
        communityCommentMapper.insert(comment);
        syncCounts(comment.getPostId());
        return comment.MapToDto();
    }

    @Override
    public CommunityReportDto Report(CommunityReportDto input) throws Exception {
        CommunityReport report = input.MapToEntity();
        if (report.getStatus() == null) report.setStatus(1);
        communityReportMapper.insert(report);
        return report.MapToDto();
    }

    @Override
    public HashMap<String, Object> Stats() {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        HashMap<String, Object> data = new HashMap<>();
        data.put("TotalPosts", communityPostMapper.selectCount(null));
        data.put("TodayPosts", communityPostMapper.selectCount(Wrappers.<CommunityPost>lambdaQuery().ge(CommunityPost::getCreationTime, today)));
        data.put("TotalComments", communityCommentMapper.selectCount(null));
        data.put("TodayComments", communityCommentMapper.selectCount(Wrappers.<CommunityComment>lambdaQuery().ge(CommunityComment::getCreationTime, today)));
        data.put("PostUserCount", communityPostMapper.selectList(null).stream().map(CommunityPost::getPublishUserId).filter(Objects::nonNull).collect(Collectors.toSet()).size());
        data.put("CommentUserCount", communityCommentMapper.selectList(null).stream().map(CommunityComment::getCommentUserId).filter(Objects::nonNull).collect(Collectors.toSet()).size());
        data.put("ActiveUsers", (Integer) data.get("PostUserCount") + (Integer) data.get("CommentUserCount"));
        return data;
    }

    private String buildAiComment(String content) {
        String text = content == null ? "" : content;
        if (text.contains("炸") || text.contains("奶茶") || text.contains("烧烤") || text.contains("肥肉")) {
            return "AI助手：本次饮食脂肪或糖分摄入可能偏高，建议增加蔬菜水果摄入。";
        }
        if (text.contains("增肌") || text.contains("蛋白")) {
            return "AI助手：蛋白质补充意识不错，建议搭配足量碳水和规律力量训练。";
        }
        if (text.contains("减脂") || text.contains("打卡")) {
            return "AI助手：减脂打卡很棒，建议保持热量缺口，同时保证优质蛋白和睡眠。";
        }
        return "AI助手：记录习惯很好，建议继续保持均衡饮食和适量运动。";
    }

    private void syncCounts(Integer postId) {
        CommunityPost post = communityPostMapper.selectById(postId);
        if (post == null) return;
        post.setLikeCount(countLikes(postId));
        post.setCollectCount(countCollects(postId));
        post.setCommentCount(countComments(postId));
        communityPostMapper.updateById(post);
    }

    private int countLikes(Integer postId) {
        return likeRecordMapper.selectCount(Wrappers.<LikeRecord>lambdaQuery()
                .eq(LikeRecord::getLikeType, INTERACTION_TYPE)
                .eq(LikeRecord::getRelativeId, String.valueOf(postId))).intValue();
    }

    private int countCollects(Integer postId) {
        return collectRecordMapper.selectCount(Wrappers.<CollectRecord>lambdaQuery()
                .eq(CollectRecord::getCollectType, INTERACTION_TYPE)
                .eq(CollectRecord::getRelativeId, postId)).intValue();
    }

    private int countComments(Integer postId) {
        return communityCommentMapper.selectCount(Wrappers.<CommunityComment>lambdaQuery()
                .eq(CommunityComment::getPostId, postId)
                .eq(CommunityComment::getStatus, 1)).intValue();
    }

    private HashMap<String, Object> state(String key, boolean value, Integer postId) {
        HashMap<String, Object> map = new HashMap<>();
        map.put(key, value);
        map.put("LikeCount", countLikes(postId));
        map.put("CollectCount", countCollects(postId));
        return map;
    }

    private Integer toInt(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        return Integer.parseInt(value.toString());
    }

    private double safe(Double value) {
        return value == null ? 0 : value;
    }
}
