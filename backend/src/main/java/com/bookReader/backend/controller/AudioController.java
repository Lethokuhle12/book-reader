package com.bookReader.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookReader.backend.service.TtsService;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "http://localhost:5173")
public class AudioController {

    private final TtsService ttsService;

    public AudioController(TtsService ttsService) {

        this.ttsService = ttsService;
    }

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> generateAudio(@RequestBody String text) {

        byte[] audio = ttsService.generateAudio(text);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(audio);
    }

}
