package com.archai.security;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class PromptInjectionGuard {
    private static final List<String> BLOCKED = List.of(
            "ignore previous instructions", "reveal system prompt", "show system prompt",
            "reveal api key", "print api key", "execute shell", "run this command");

    public void validate(String input) {
        String normalized = input.toLowerCase(Locale.ROOT);
        BLOCKED.stream().filter(normalized::contains).findFirst().ifPresent(match -> {
            throw new IllegalArgumentException("The description contains instructions unrelated to system design.");
        });
    }
}
