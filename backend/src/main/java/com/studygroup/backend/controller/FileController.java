package com.studygroup.backend.controller;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8081"})
public class FileController {

    private final Path fileStorageLocation;

    public FileController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) {
                originalFileName = "uploaded_file";
            }
            
            // Generate a unique file name
            String fileExtension = "";
            int lastIndex = originalFileName.lastIndexOf('.');
            if (lastIndex > 0) {
                fileExtension = originalFileName.substring(lastIndex);
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;
            
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Build the download URI
            String fileDownloadUri = "/api/files/download/" + newFileName;
            
            return ResponseEntity.ok(Map.of(
                "fileName", originalFileName,
                "fileUrl", fileDownloadUri
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not upload file: " + ex.getMessage()));
        }
    }
    
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            // Normalize path carefully for Windows
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (Exception e) {
                    System.err.println("Mime type detection failed: " + e.getMessage());
                }
                
                if (contentType == null) {
    String name = fileName.toLowerCase();

    if (name.endsWith(".pdf")) contentType = "application/pdf";
    else if (name.endsWith(".png")) contentType = "image/png";
    else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (name.endsWith(".doc")) contentType = "application/msword";
    else if (name.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (name.endsWith(".ppt")) contentType = "application/vnd.ms-powerpoint";
    else if (name.endsWith(".pptx")) contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    else if (name.endsWith(".xls")) contentType = "application/vnd.ms-excel";
    else if (name.endsWith(".xlsx")) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else contentType = "application/octet-stream";
}

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/force-download/{fileName:.+}")
public ResponseEntity<Resource> forceDownloadFile(@PathVariable String fileName) {
    try {
        // Normalize path carefully for Windows
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        if (!filePath.startsWith(this.fileStorageLocation)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            // Force download with attachment header
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    } catch (MalformedURLException ex) {
        return ResponseEntity.notFound().build();
    }
}
    
}
