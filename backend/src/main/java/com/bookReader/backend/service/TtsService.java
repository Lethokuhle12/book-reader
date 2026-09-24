package com.bookReader.backend.service;

public interface TtsService {

    byte[] generateAudio(String text);
}
