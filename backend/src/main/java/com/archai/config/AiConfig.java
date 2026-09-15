package com.archai.config;

import com.archai.ai.GeminiProvider;
import com.archai.ai.LLMProvider;
import com.archai.ai.UnavailableLLMProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    LLMProvider llmProvider(
            @Value("${archai.ai.api-key:}") String apiKey,
            @Value("${archai.ai.model:gemini-3.6-flash}") String model,
            @Value("${archai.ai.max-output-tokens:8192}") int maxOutputTokens) {
        if (apiKey == null || apiKey.isBlank()) return new UnavailableLLMProvider();
        return new GeminiProvider(apiKey, model, maxOutputTokens);
    }
}
