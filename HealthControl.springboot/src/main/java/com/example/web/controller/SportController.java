package com.example.web.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.web.dto.SportDto;
import com.example.web.dto.SportUnitDto;
import com.example.web.dto.query.SportPagedInput;
import com.example.web.dto.query.SportUnitPagedInput;
import com.example.web.entity.Sport;
import com.example.web.entity.SportUnit;
import com.example.web.mapper.SportMapper;
import com.example.web.mapper.SportUnitMapper;
import com.example.web.tools.Extension;
import com.example.web.tools.dto.IdInput;
import com.example.web.tools.dto.IdsInput;
import com.example.web.tools.dto.PagedResult;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Sport")
public class SportController {

    @Autowired
    private SportMapper sportMapper;

    @Autowired
    private SportUnitMapper sportUnitMapper;

    @RequestMapping(value = "/List", method = RequestMethod.POST)
    @SneakyThrows
    public List<SportDto> List() {
        List<Sport> sports = sportMapper.selectList(Wrappers.<Sport>lambdaQuery().orderByAsc(Sport::getId));
        List<SportDto> items = Extension.copyBeanList(sports, SportDto.class);
        fillSportUnits(items);
        return items;
    }

    @RequestMapping(value = "/AdminList", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<SportDto> AdminList(@RequestBody SportPagedInput input) {
        List<Sport> sports = sportMapper.selectList(Wrappers.<Sport>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, Sport::getId, input.getId())
                .like(Extension.isNotNullOrEmpty(input.getName()), Sport::getName, input.getName())
                .orderByAsc(Sport::getId));
        List<SportDto> items = Extension.copyBeanList(sports, SportDto.class);
        fillSportUnits(items);
        return Extension.PagedResultBuild(items, input);
    }

    @RequestMapping(value = "/Get", method = RequestMethod.POST)
    @SneakyThrows
    public SportDto Get(@RequestBody SportPagedInput input) {
        if (input.getId() == null) {
            return new SportDto();
        }
        return AdminList(input).getItems().stream().findFirst().orElse(new SportDto());
    }

    @RequestMapping(value = "/CreateOrEdit", method = RequestMethod.POST)
    @SneakyThrows
    public SportDto CreateOrEdit(@RequestBody SportDto input) {
        Sport sport = input.MapToEntity();
        if (sport.getContent() == null) {
            sport.setContent("");
        }
        if (sport.getId() == null) {
            sportMapper.insert(sport);
        } else {
            sportMapper.updateById(sport);
        }
        return sport.MapToDto();
    }

    @RequestMapping(value = "/Delete", method = RequestMethod.POST)
    public void Delete(@RequestBody IdInput input) {
        if (input == null || input.getId() == null) return;
        sportUnitMapper.delete(Wrappers.<SportUnit>lambdaQuery().eq(SportUnit::getSportId, input.getId()));
        sportMapper.deleteById(input.getId());
    }

    @RequestMapping(value = "/BatchDelete", method = RequestMethod.POST)
    public void BatchDelete(@RequestBody IdsInput input) {
        if (input == null || input.getIds() == null) return;
        for (Integer id : input.getIds()) {
            IdInput idInput = new IdInput();
            idInput.setId(id);
            Delete(idInput);
        }
    }

    @RequestMapping(value = "/UnitList", method = RequestMethod.POST)
    @SneakyThrows
    public PagedResult<SportUnitDto> UnitList(@RequestBody SportUnitPagedInput input) {
        List<SportUnit> units = sportUnitMapper.selectList(Wrappers.<SportUnit>lambdaQuery()
                .eq(input.getId() != null && input.getId() != 0, SportUnit::getId, input.getId())
                .eq(input.getSportId() != null, SportUnit::getSportId, input.getSportId())
                .like(Extension.isNotNullOrEmpty(input.getUnitName()), SportUnit::getUnitName, input.getUnitName())
                .orderByAsc(SportUnit::getSportId)
                .orderByAsc(SportUnit::getId));
        List<SportUnitDto> items = Extension.copyBeanList(units, SportUnitDto.class);
        return Extension.PagedResultBuild(items, input);
    }

    @RequestMapping(value = "/UnitGet", method = RequestMethod.POST)
    @SneakyThrows
    public SportUnitDto UnitGet(@RequestBody SportUnitPagedInput input) {
        if (input.getId() == null) {
            return new SportUnitDto();
        }
        return UnitList(input).getItems().stream().findFirst().orElse(new SportUnitDto());
    }

    @RequestMapping(value = "/UnitCreateOrEdit", method = RequestMethod.POST)
    @SneakyThrows
    public SportUnitDto UnitCreateOrEdit(@RequestBody SportUnitDto input) {
        SportUnit unit = input.MapToEntity();
        if (unit.getId() == null) {
            sportUnitMapper.insert(unit);
        } else {
            sportUnitMapper.updateById(unit);
        }
        return unit.MapToDto();
    }

    @RequestMapping(value = "/UnitDelete", method = RequestMethod.POST)
    public void UnitDelete(@RequestBody IdInput input) {
        if (input != null && input.getId() != null) {
            sportUnitMapper.deleteById(input.getId());
        }
    }

    @RequestMapping(value = "/UnitBatchDelete", method = RequestMethod.POST)
    public void UnitBatchDelete(@RequestBody IdsInput input) {
        if (input == null || input.getIds() == null) return;
        for (Integer id : input.getIds()) {
            sportUnitMapper.deleteById(id);
        }
    }

    @SneakyThrows
    private void fillSportUnits(List<SportDto> items) {
        for (SportDto item : items) {
            List<SportUnit> units = sportUnitMapper.selectList(
                    Wrappers.<SportUnit>lambdaQuery()
                            .eq(SportUnit::getSportId, item.getId())
                            .orderByAsc(SportUnit::getId)
            );
            item.setSportUnits(Extension.copyBeanList(units, SportUnitDto.class));
        }
    }
}
