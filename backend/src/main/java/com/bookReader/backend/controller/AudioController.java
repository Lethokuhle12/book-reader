package com.bookReader.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/voices")
    public ResponseEntity<List<Map<String, Object>>> getVoices() {
        return ResponseEntity.ok(ttsService.getAvailableVoices());
    }

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> generateAudio(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "text", required = false) String paramText,
            @RequestParam(value = "voice", required = false) String paramVoice,
            @RequestParam(value = "rate", required = false, defaultValue = "1.0") double paramRate) {

        String text = paramText;
        String voice = paramVoice;
        double rate = paramRate;

        if (body != null) {
            if (body.containsKey("text") && body.get("text") != null) {
                text = body.get("text").toString();
            }
            if (body.containsKey("voice") && body.get("voice") != null) {
                voice = body.get("voice").toString();
            }
            if (body.containsKey("rate") && body.get("rate") != null) {
                try {
                    rate = Double.parseDouble(body.get("rate").toString());
                } catch (NumberFormatException ignored) {
                }
            }
        }

        byte[] audio = ttsService.generateAudio(text, voice, rate);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(audio);
    }
}
