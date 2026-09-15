package com.archai.ai;

import java.util.Map;

public interface LLMProvider {
    String generateStructured(String systemInstruction, String userContent, Map<String, Object> responseSchema);
    boolean isAvailable();
}
