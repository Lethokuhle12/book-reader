package com.bookReader.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookReader.backend.dto.ExplanationRequest;
import com.bookReader.backend.dto.ExplanationResponse;
import com.bookReader.backend.service.AiExplanationService;

@RestController
@RequestMapping("/api/explain")
@CrossOrigin(origins = "http://localhost:5173")
public class ExplanationController {

    private final AiExplanationService explanationService;

    public ExplanationController(AiExplanationService explanationService) {
        this.explanationService = explanationService;
    }

    @PostMapping
    public ResponseEntity<ExplanationResponse> explain(@RequestBody ExplanationRequest request) {
        ExplanationResponse response = explanationService.explainTerm(request);
        return ResponseEntity.ok(response);
    }
}
