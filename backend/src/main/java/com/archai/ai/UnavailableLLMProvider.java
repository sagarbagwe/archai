package com.archai.ai;

import java.util.Map;

public final class UnavailableLLMProvider implements LLMProvider {
    @Override
    public String generateStructured(String systemInstruction, String userContent, Map<String, Object> responseSchema) {
        throw new AIUnavailableException("Gemini is not configured. Set GEMINI_API_KEY on the backend.");
    }
    @Override public boolean isAvailable() { return false; }
}
