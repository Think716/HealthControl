package com.example.web.controller;

import com.example.web.dto.AiAnalyzeUserHealthDto;
import com.example.web.dto.AiHealthAnalysisResponseDto;
import com.example.web.service.AiAnalyseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/AiAnalyse")
public class AiAnalyseController {

    @Autowired
    private AiAnalyseService aiAnalyseService;

    /**
     * 用户健康分析（推荐接口）
     */
    @PostMapping("/AnalyzeUserHealth")
    public AiHealthAnalysisResponseDto analyzeUserHealth(
            @RequestBody AiAnalyzeUserHealthDto input) {

        if (input == null || input.getUserId() == null) {
            return error("userId不能为空");
        }

        int days = input.getDays() == null ? 7 : input.getDays();

        try {
            return aiAnalyseService.analyzeUserHealth(input.getUserId(), days);
        } catch (Exception e) {
            log.error("AI分析失败 userId={}", input.getUserId(), e);
            return error("系统异常，请稍后重试");
        }
    }

    /**
     * 自定义数据分析
     */
    @PostMapping("/AnalyzeHealthData")
    public AiHealthAnalysisResponseDto analyzeHealthData(
            @RequestBody com.example.web.dto.AiHealthAnalysisRequestDto input) {

        if (input == null) {
            return error("请求数据不能为空");
        }

        try {
            return aiAnalyseService.analyzeHealthData(input);
        } catch (Exception e) {
            log.error("AI数据分析失败", e);
            return error("分析失败");
        }
    }

    // ================== 统一错误返回 ==================
    private AiHealthAnalysisResponseDto error(String msg) {
        AiHealthAnalysisResponseDto dto = new AiHealthAnalysisResponseDto();
        dto.setSuccess(false);
        dto.setErrorMessage(msg);
        return dto;
    }
}
