package com.bookReader.backend.controller;

import java.io.IOException;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:5173")
public class PdfController {

    @PostMapping("/extract")
    public ResponseEntity<?> extractText(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {

            return ResponseEntity.badRequest().body(Map.of("error", "Please uploaf a PDF"));
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {

            return ResponseEntity.badRequest().body(Map.of("error", "Only pdf files are allowed"));

        }

        try {

            PDDocument document = Loader.loadPDF(file.getBytes());

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            document.close();

            return ResponseEntity.ok(
                    Map.of("filename", file.getOriginalFilename(),
                            "text", text));

        } catch (IOException e) {

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to read PDF",
                            "message", e.getMessage())

                    );
        }

    }
}
