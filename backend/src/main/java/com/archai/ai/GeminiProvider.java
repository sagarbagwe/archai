package com.archai.ai;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.HttpRetryOptions;
import com.google.genai.types.Part;
import java.util.Map;

public final class GeminiProvider implements LLMProvider {
    private final Client client;
    private final String model;
    private final int maxOutputTokens;

    public GeminiProvider(String apiKey, String model, int maxOutputTokens) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .httpOptions(HttpOptions.builder()
                        .timeout(90_000)
                        .retryOptions(HttpRetryOptions.builder().attempts(3).httpStatusCodes(408, 429, 500, 502, 503, 504)))
                .build();
        this.model = model;
        this.maxOutputTokens = maxOutputTokens;
    }

    @Override
    public String generateStructured(String systemInstruction, String userContent, Map<String, Object> responseSchema) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(systemInstruction)))
                .responseMimeType("application/json")
                .responseSchema(responseSchema)
                .candidateCount(1)
                .maxOutputTokens(maxOutputTokens)
                .build();
        GenerateContentResponse response = client.models.generateContent(model, userContent, config);
        String text = response.text();
        if (text == null || text.isBlank()) throw new AIUnavailableException("AI returned an empty response.");
        return text;
    }

    @Override public boolean isAvailable() { return true; }
}
