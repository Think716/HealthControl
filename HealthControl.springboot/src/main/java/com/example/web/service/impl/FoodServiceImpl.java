package com.example.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.web.dto.FoodDto;
import com.example.web.dto.FoodTypeDto;
import com.example.web.dto.query.FoodPagedInput;
import com.example.web.entity.Food;
import com.example.web.entity.FoodType;
import com.example.web.mapper.FoodMapper;
import com.example.web.mapper.FoodTypeMapper;
import com.example.web.service.FoodService;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.IdsInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FoodServiceImpl extends ServiceImpl<FoodMapper, Food> implements FoodService {

    private static final Map<String, String> DEFAULT_FOOD_COVERS = new HashMap<>();

    static {
        DEFAULT_FOOD_COVERS.put("白米饭", "/food-covers/white-rice.png");
        DEFAULT_FOOD_COVERS.put("全麦面包", "/food-covers/whole-wheat-bread.png");
        DEFAULT_FOOD_COVERS.put("燕麦片", "/food-covers/oatmeal.png");
        DEFAULT_FOOD_COVERS.put("西兰花", "/food-covers/broccoli.png");
        DEFAULT_FOOD_COVERS.put("胡萝卜", "/food-covers/carrot.png");
        DEFAULT_FOOD_COVERS.put("菠菜", "/food-covers/spinach.png");
        DEFAULT_FOOD_COVERS.put("苹果", "/food-covers/apple.png");
        DEFAULT_FOOD_COVERS.put("香蕉", "/food-covers/banana.png");
        DEFAULT_FOOD_COVERS.put("橙子", "/food-covers/orange.png");
        DEFAULT_FOOD_COVERS.put("鸡胸肉", "/food-covers/chicken-breast.png");
        DEFAULT_FOOD_COVERS.put("猪瘦肉", "/food-covers/lean-pork.png");
        DEFAULT_FOOD_COVERS.put("三文鱼", "/food-covers/salmon.png");
        DEFAULT_FOOD_COVERS.put("鸡蛋", "/food-covers/egg.png");
        DEFAULT_FOOD_COVERS.put("牛奶", "/food-covers/milk.png");
        DEFAULT_FOOD_COVERS.put("酸奶", "/food-covers/yogurt.png");
        DEFAULT_FOOD_COVERS.put("黄豆", "/food-covers/soybean.png");
        DEFAULT_FOOD_COVERS.put("豆腐", "/food-covers/tofu.png");
        DEFAULT_FOOD_COVERS.put("杏仁", "/food-covers/almond.png");
        DEFAULT_FOOD_COVERS.put("核桃", "/food-covers/walnut.png");
        DEFAULT_FOOD_COVERS.put("绿茶", "/food-covers/green-tea.png");
    }

    @Value("${server.ip:http://localhost:7245}")
    private String serverIp;

    @Autowired
    private FoodMapper FoodMapper;

    @Autowired
    private FoodTypeMapper FoodTypeMapper;

    private LambdaQueryWrapper<Food> BuilderQuery(FoodPagedInput input) {
        LambdaQueryWrapper<Food> queryWrapper = Wrappers.<Food>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, Food::getId, input.getId());

        if (Extension.isNotNullOrEmpty(input.getName())) {
            queryWrapper.like(Food::getName, input.getName());
        }

        if (input.getFoodTypeId() != null) {
            queryWrapper.eq(Food::getFoodTypeId, input.getFoodTypeId());
        }

        if (Extension.isNotNullOrEmpty(input.getKeyWord())) {
            queryWrapper.and(i -> i.like(Food::getName, input.getKeyWord()));
        }

        return queryWrapper;
    }

    private List<FoodDto> DispatchItem(List<FoodDto> items) throws InvocationTargetException, IllegalAccessException {
        for (FoodDto item : items) {
            ensureCover(item);
            FoodType foodTypeEntity = FoodTypeMapper.selectById(item.getFoodTypeId());
            item.setFoodTypeDto(foodTypeEntity != null ? foodTypeEntity.MapToDto() : new FoodTypeDto());
        }

        return items;
    }

    @SneakyThrows
    @Override
    public PagedResult<FoodDto> List(FoodPagedInput input) {
        LambdaQueryWrapper<Food> queryWrapper = BuilderQuery(input);
        if (input.getSortItem() != null) {
            queryWrapper.last("ORDER BY " + input.getSortItem().getFieldName()
                    + (input.getSortItem().getIsAsc() ? " ASC" : " DESC"));
        } else {
            queryWrapper.orderByDesc(Food::getCreationTime);
        }

        Page<Food> page = new Page<>(input.getPage(), input.getLimit());
        IPage<Food> pageRecords = FoodMapper.selectPage(page, queryWrapper);
        Long totalCount = FoodMapper.selectCount(queryWrapper);
        List<FoodDto> items = Extension.copyBeanList(pageRecords.getRecords(), FoodDto.class);

        DispatchItem(items);
        return PagedResult.GetInstance(items, totalCount);
    }

    @SneakyThrows
    @Override
    public FoodDto Get(FoodPagedInput input) {
        if (input.getId() == null) {
            return new FoodDto();
        }

        PagedResult<FoodDto> pagedResult = List(input);
        return pagedResult.getItems().stream().findFirst().orElse(new FoodDto());
    }

    @SneakyThrows
    @Override
    public FoodDto CreateOrEdit(FoodDto input) {
        if (Extension.isNullOrEmpty(input.getCover()) || isBrokenLocalCover(input.getCover())) {
            input.setCover(getDefaultCover(input.getName()));
        }

        Food food = input.MapToEntity();
        saveOrUpdate(food);
        return food.MapToDto();
    }

    @Override
    public void Delete(IdInput input) {
        Food entity = FoodMapper.selectById(input.getId());
        FoodMapper.deleteById(entity);
    }

    @Override
    public void BatchDelete(IdsInput input) {
        for (Integer id : input.getIds()) {
            IdInput idInput = new IdInput();
            idInput.setId(id);
            Delete(idInput);
        }
    }

    private void ensureCover(FoodDto item) {
        if (item == null || (Extension.isNotNullOrEmpty(item.getCover()) && !isBrokenLocalCover(item.getCover()))) {
            return;
        }

        String cover = getDefaultCover(item.getName());
        if (Extension.isNullOrEmpty(cover)) {
            return;
        }
        item.setCover(cover);
        if (item.getId() != null) {
            Food food = FoodMapper.selectById(item.getId());
            if (food != null && (Extension.isNullOrEmpty(food.getCover()) || isBrokenLocalCover(food.getCover()))) {
                food.setCover(cover);
                FoodMapper.updateById(food);
            }
        }
    }

    private String getDefaultCover(String name) {
        if (Extension.isNullOrEmpty(name)) {
            return null;
        }
        String path = DEFAULT_FOOD_COVERS.get(name);
        return path == null ? null : serverIp + path;
    }

    private boolean isBrokenLocalCover(String cover) {
        if (Extension.isNullOrEmpty(cover)) {
            return true;
        }

        try {
            URI uri = URI.create(cover);
            String host = uri.getHost();
            if (host == null || (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host))) {
                return false;
            }

            String relativePath = uri.getPath();
            if (relativePath == null || relativePath.length() <= 1) {
                return true;
            }

            File file = new File(System.getProperty("user.dir"), "external-resources" + relativePath);
            return !file.exists();
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
