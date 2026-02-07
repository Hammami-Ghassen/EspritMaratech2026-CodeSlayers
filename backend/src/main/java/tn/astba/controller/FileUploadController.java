package tn.astba.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.astba.service.FileStorageService;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Upload de fichiers (images)")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/image")
    @Operation(summary = "Upload d'une image", description = "Retourne l'URL relative de l'image uploadée")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String filename = fileStorageService.store(file);
        String imageUrl = "/uploads/" + filename;
        return ResponseEntity.ok(Map.of(
                "filename", filename,
                "imageUrl", imageUrl
        ));
    }
}
