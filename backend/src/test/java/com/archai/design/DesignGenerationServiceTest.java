package com.archai.design;

import static org.assertj.core.api.Assertions.assertThat;

import com.archai.ai.LLMProvider;
import com.archai.ai.PromptBuilder;
import com.archai.architecture.ArchitectureValidator;
import com.archai.estimation.CapacityEstimator;
import com.archai.security.PromptInjectionGuard;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DesignGenerationServiceTest {
    @Test
    void emitsOnlyCompletedRealStages() {
        LLMProvider fake = new LLMProvider() {
            int call;
            public String generateStructured(String system, String user, Map<String, Object> schema) {
                return call++ == 0
                    ? "{\"functional\":[\"Create payment\"],\"nonFunctional\":[\"Highly available\"],\"assumptions\":[],\"constraints\":[]}"
                    : "{\"nodes\":[{\"id\":\"client\",\"name\":\"Client\",\"type\":\"Client\",\"technology\":\"Browser\",\"description\":\"Entry\",\"responsibilities\":[\"Requests\"],\"scalingStrategy\":\"N/A\"}],\"edges\":[]}";
            }
            public boolean isAvailable() { return true; }
        };
        ObjectMapper mapper = new ObjectMapper();
        DesignGenerationService service = new DesignGenerationService(fake, new PromptBuilder(mapper), mapper,
                new CapacityEstimator(), new ArchitectureValidator(), new PromptInjectionGuard());
        List<GenerationEvent> events = new ArrayList<>();
        service.generate(new GenerationRequest("Payment System", "Design a global payment processing system.",
                10_000_000, 20, new BigDecimal("5"), new BigDecimal("0.8"), 1024, "Refunds"), events::add);
        assertThat(events).extracting(GenerationEvent::type)
                .containsExactly("stage.started", "stage.completed", "stage.started", "stage.completed", "stage.started", "stage.completed");
    }
}
