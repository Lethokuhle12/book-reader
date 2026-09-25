package com.bookReader.backend.service.impl;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookReader.backend.dto.ExplanationRequest;
import com.bookReader.backend.dto.ExplanationResponse;
import com.bookReader.backend.service.AiExplanationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiExplanationServiceImpl implements AiExplanationService {

    @Value("${openai.api.key:${OPENAI_API_KEY:}}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public ExplanationResponse explainTerm(ExplanationRequest request) {
        String term = request.getText() != null ? request.getText().trim() : "";
        String context = request.getContext() != null ? request.getContext().trim() : "";
        String bookTitle = request.getBookTitle() != null ? request.getBookTitle().trim() : "";

        if (term.isEmpty()) {
            return new ExplanationResponse(
                    "",
                    "No term selected.",
                    "Please select or type a word or phrase to explain.",
                    "",
                    ""
            );
        }

        if (openAiApiKey != null && !openAiApiKey.trim().isEmpty()) {
            try {
                ExplanationResponse response = callOpenAi(term, context, bookTitle);
                if (response != null) {
                    return response;
                }
            } catch (Exception e) {
                System.err.println("Error calling OpenAI API: " + e.getMessage());
            }
        }

        // Fallback response when API key is not configured or API call fails
        return generateFallbackExplanation(term, context);
    }

    private ExplanationResponse callOpenAi(String term, String context, String bookTitle) throws Exception {
        String systemPrompt = "You are a concise, helpful reading assistant in an audiobook reader application. " +
                "Given a word/phrase, surrounding context from the book, and book title, explain what the term means in simple language. " +
                "Respond ONLY with a valid JSON object with keys: 'definition', 'contextualMeaning', 'example', 'pronunciation'. Do not wrap in markdown syntax.";

        String userPrompt = String.format(
                "Term: \"%s\"\nContext: \"%s\"\nBook: \"%s\"",
                term, context, bookTitle
        );

        String payload = objectMapper.writeValueAsString(java.util.Map.of(
                "model", modelName,
                "messages", java.util.List.of(
                        java.util.Map.of("role", "system", "content", systemPrompt),
                        java.util.Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.3,
                "response_format", java.util.Map.of("type", "json_object")
        ));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            JsonNode parsed = objectMapper.readTree(content);

            return new ExplanationResponse(
                    term,
                    parsed.path("definition").asText(""),
                    parsed.path("contextualMeaning").asText(""),
                    parsed.path("example").asText(""),
                    parsed.path("pronunciation").asText("")
            );
        }

        return null;
    }

    private ExplanationResponse generateFallbackExplanation(String term, String context) {
        String definition = "AI explanation unavailable (configure OPENAI_API_KEY environment variable to enable live AI definitions).";
        String contextualMeaning = context != null && !context.trim().isEmpty()
                ? String.format("Context passage: \"%s\"", context.length() > 140 ? context.substring(0, 140) + "..." : context)
                : "";

        return new ExplanationResponse(
                term,
                definition,
                contextualMeaning,
                "",
                ""
        );
    }
}
