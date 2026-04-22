package com.example.web.service;

import org.springframework.web.multipart.MultipartFile;
import com.example.web.dto.VoiceRecognizeRequestDto;
import com.example.web.dto.VoiceRecognizeResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface VoiceService {

    VoiceRecognizeResponseDto recognizeAndSave(Integer userId, MultipartFile file);

    VoiceRecognizeResponseDto recognizeTextAndSave(VoiceRecognizeRequestDto requestDto);

}