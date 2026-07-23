package com.example.web.controller;

import com.example.web.tools.dto.FileResultDto;
import com.example.web.tools.exception.CustomException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;

@RestController
@RequestMapping("/File")
public class FileController {

    @PostMapping("/BatchUpload")
    public ArrayList<FileResultDto> uploadFile(@RequestParam("file") MultipartFile[] files,
                                               @RequestParam(value = "category", required = false) String category,
                                               HttpServletRequest request) {
        ArrayList<FileResultDto> fileResultDtos = new ArrayList<>();
        String projectPath = System.getProperty("user.dir");
        File resourceRoot = new File(projectPath, "external-resources");
        if (!resourceRoot.exists()) {
            resourceRoot.mkdirs();
        }

        for (MultipartFile file : files) {
            if (file.isEmpty() || file.getSize() <= 0) {
                throw new CustomException("Uploaded file cannot be empty");
            }
        }

        String safeCategory = normalizeCategory(category);
        String dateFolder = LocalDate.now().toString().replace("-", "");
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        for (MultipartFile file : files) {
            String originFileName = file.getOriginalFilename();
            if (originFileName == null || originFileName.trim().isEmpty()) {
                throw new CustomException("File name cannot be empty");
            }

            long randomNumber = (long) (Math.random() * 1000000000);
            File dirFile = new File(resourceRoot, safeCategory + File.separator + dateFolder + File.separator + randomNumber);
            if (!dirFile.exists()) {
                dirFile.mkdirs();
            }

            try (FileOutputStream fileOutputStream = new FileOutputStream(new File(dirFile, originFileName))) {
                fileOutputStream.write(file.getBytes());
                fileOutputStream.flush();
            } catch (java.io.IOException e) {
                throw new CustomException("File upload failed");
            }

            String encodedFileName = URLEncoder.encode(originFileName, StandardCharsets.UTF_8).replace("+", "%20");
            String url = baseUrl + "/" + safeCategory + "/" + dateFolder + "/" + randomNumber + "/" + encodedFileName;
            fileResultDtos.add(new FileResultDto(url, originFileName));
        }

        return fileResultDtos;
    }

    private String normalizeCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return "uploads";
        }
        String safe = category.trim().replace("\\", "/");
        safe = safe.replaceAll("[^a-zA-Z0-9/_-]", "");
        safe = safe.replaceAll("/+", "/");
        safe = safe.replaceAll("^/|/$", "");
        if (safe.isEmpty() || safe.contains("..")) {
            return "uploads";
        }
        return safe;
    }
}
