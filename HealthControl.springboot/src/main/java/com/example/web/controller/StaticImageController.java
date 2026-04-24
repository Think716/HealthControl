package com.example.web.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * 兜底图片静态资源访问：
 * 1) 优先按 /{数字目录}/{文件名} 读取 external-resources 下对应目录文件；
 * 2) 若目录不存在，按文件名在 external-resources 下检索历史同名文件。
 */
@RestController
public class StaticImageController {

    @GetMapping("/{folder:\\d+}/{filename:.+\\.(png|jpg|jpeg|gif|webp)}")
    public ResponseEntity<Resource> getImage(@PathVariable String folder, @PathVariable String filename) {
        Path baseDir = Path.of(System.getProperty("user.dir"), "external-resources").normalize();
        Path targetFile = baseDir.resolve(folder).resolve(filename).normalize();

        if (targetFile.startsWith(baseDir) && Files.exists(targetFile) && Files.isRegularFile(targetFile)) {
            return buildResourceResponse(targetFile);
        }

        Path fallbackFile = findByFileName(baseDir, filename);
        if (fallbackFile != null) {
            return buildResourceResponse(fallbackFile);
        }

        return ResponseEntity.notFound().build();
    }

    private Path findByFileName(Path baseDir, String filename) {
        if (!Files.exists(baseDir)) {
            return null;
        }
        try (Stream<Path> paths = Files.walk(baseDir, 2)) {
            Optional<Path> firstMatch = paths
                    .filter(Files::isRegularFile)
                    .filter(path -> filename.equals(path.getFileName().toString()))
                    .findFirst();
            return firstMatch.orElse(null);
        } catch (IOException e) {
            return null;
        }
    }

    private ResponseEntity<Resource> buildResourceResponse(Path filePath) {
        try {
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
