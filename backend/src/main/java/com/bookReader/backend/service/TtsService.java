package com.bookReader.backend.service;

import java.util.List;
import java.util.Map;

public interface TtsService {

    byte[] generateAudio(String text, String voiceName, double rate);

    List<Map<String, Object>> getAvailableVoices();
}
