package com.bookReader.backend.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.bookReader.backend.config.AzureConfig;
import com.bookReader.backend.service.TtsService;
import com.microsoft.cognitiveservices.speech.SpeechConfig;
import com.microsoft.cognitiveservices.speech.SpeechSynthesizer;
import com.microsoft.cognitiveservices.speech.SpeechSynthesisResult;

@Service
public class TtsServiceImpl implements TtsService {

    private final AzureConfig azureConfig;

    public TtsServiceImpl(AzureConfig azureConfig) {
        this.azureConfig = azureConfig;
    }

    @Override
    public byte[] generateAudio(String text, String voiceName, double rate) {
        if (text == null || text.trim().isEmpty()) {
            return new byte[0];
        }

        if (azureConfig.isConfigured()) {
            try {
                SpeechConfig config = SpeechConfig.fromSubscription(
                        azureConfig.getSpeechKey(),
                        azureConfig.getSpeechRegion()
                );

                if (voiceName != null && !voiceName.trim().isEmpty()) {
                    config.setSpeechSynthesisVoiceName(voiceName);
                } else {
                    config.setSpeechSynthesisVoiceName("en-US-AvaMultilingualNeural");
                }

                try (SpeechSynthesizer synthesizer = new SpeechSynthesizer(config)) {
                    SpeechSynthesisResult result = synthesizer.SpeakTextAsync(text).get();
                    if (result != null && result.getAudioData() != null) {
                        return result.getAudioData();
                    }
                }
            } catch (Exception e) {
                System.err.println("Azure TTS synthesis error: " + e.getMessage());
            }
        }

        return new byte[0];
    }

    @Override
    public List<Map<String, Object>> getAvailableVoices() {
        List<Map<String, Object>> voices = new ArrayList<>();

        voices.add(createVoiceMap("en-US-AvaMultilingualNeural", "Ava (Multilingual)", "en-US", "Female", "United States", "Azure Neural"));
        voices.add(createVoiceMap("en-US-AndrewMultilingualNeural", "Andrew (Multilingual)", "en-US", "Male", "United States", "Azure Neural"));
        voices.add(createVoiceMap("en-US-JennyNeural", "Jenny", "en-US", "Female", "United States", "Azure Neural"));
        voices.add(createVoiceMap("en-US-GuyNeural", "Guy", "en-US", "Male", "United States", "Azure Neural"));
        voices.add(createVoiceMap("en-GB-SoniaNeural", "Sonia", "en-GB", "Female", "United Kingdom", "Azure Neural"));
        voices.add(createVoiceMap("en-GB-RyanNeural", "Ryan", "en-GB", "Male", "United Kingdom", "Azure Neural"));
        voices.add(createVoiceMap("en-AU-NatashaNeural", "Natasha", "en-AU", "Female", "Australia", "Azure Neural"));
        voices.add(createVoiceMap("es-ES-ElviraNeural", "Elvira", "es-ES", "Female", "Spain", "Azure Neural"));
        voices.add(createVoiceMap("fr-FR-DeniseNeural", "Denise", "fr-FR", "Female", "France", "Azure Neural"));
        voices.add(createVoiceMap("de-DE-KatjaNeural", "Katja", "de-DE", "Female", "Germany", "Azure Neural"));

        return voices;
    }

    private Map<String, Object> createVoiceMap(String name, String displayName, String language, String gender, String region, String provider) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("displayName", displayName);
        map.put("language", language);
        map.put("gender", gender);
        map.put("region", region);
        map.put("provider", provider);
        return map;
    }
}
