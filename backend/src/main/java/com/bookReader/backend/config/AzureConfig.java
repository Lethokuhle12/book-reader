package com.bookReader.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AzureConfig {

    @Value("${azure.speech.key:${AZURE_SPEECH_KEY:}}")
    private String speechKey;

    @Value("${azure.speech.region:${AZURE_SPEECH_REGION:eastus}}")
    private String speechRegion;

    public String getSpeechKey() {
        return speechKey;
    }

    public String getSpeechRegion() {
        return speechRegion;
    }

    public boolean isConfigured() {
        return speechKey != null && !speechKey.trim().isEmpty() && speechRegion != null && !speechRegion.trim().isEmpty();
    }
}
