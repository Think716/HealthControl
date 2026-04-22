package com.example.web.controller;

import com.example.web.dto.VoiceRecognizeRequestDto;
import com.example.web.dto.VoiceRecognizeResponseDto;
import com.example.web.service.VoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    @Autowired
    private VoiceService voiceService;

    @PostMapping("/recognize")
    public VoiceRecognizeResponseDto recognize(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Integer userId) {

        return voiceService.recognizeAndSave(userId, file);
    }

    @PostMapping("/recognize-text")
    public VoiceRecognizeResponseDto recognizeText(@RequestBody VoiceRecognizeRequestDto requestDto) {
        return voiceService.recognizeTextAndSave(requestDto);
    }
}