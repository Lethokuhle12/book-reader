package com.bookReader.backend.service.impl;

import org.springframework.stereotype.Service;

import com.bookReader.backend.service.TtsService;

@Service
public class TtsServiceImpl implements TtsService {

    @Override
    public byte[] generateAudio(String text) {

        return new byte[0];
    }

}
