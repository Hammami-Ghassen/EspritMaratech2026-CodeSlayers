package tn.astba.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${astba.upload.dir:uploads}")
    private String uploadDir;

    @Value("${astba.upload.allowed-types:image/jpeg,image/png,image/gif,image/webp}")
    private String allowedTypesStr;

    private Path uploadPath;
    private List<String> allowedTypes;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        allowedTypes = List.of(allowedTypesStr.split(","));
        try {
            Files.createDirectories(uploadPath);
            log.info("Upload directory ready: {}", uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload: " + uploadPath, e);
        }
    }

    /**
     * Store a file and return the generated filename (UUID + original extension).
     */
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("Type de fichier non autorisé: " + contentType
                    + ". Types autorisés: " + String.join(", ", allowedTypes));
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String storedFilename = UUID.randomUUID() + extension;

        try {
            Path targetLocation = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Fichier stocké: {} -> {}", originalFilename, storedFilename);
            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier: " + originalFilename, e);
        }
    }

    /**
     * Delete a previously stored file.
     */
    public void delete(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.debug("Fichier supprimé: {}", filename);
        } catch (IOException e) {
            log.warn("Impossible de supprimer le fichier: {}", filename, e);
        }
    }

    public Path getUploadPath() {
        return uploadPath;
    }
}
