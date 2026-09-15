package com.archai.design;

import com.archai.ai.LLMProvider;
import com.archai.ai.PromptBuilder;
import com.archai.architecture.ArchitectureDraft;
import com.archai.architecture.ArchitectureValidator;
import com.archai.estimation.CapacityEstimate;
import com.archai.estimation.CapacityEstimateRequest;
import com.archai.estimation.CapacityEstimator;
import com.archai.security.PromptInjectionGuard;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.function.Consumer;
import org.springframework.stereotype.Service;

@Service
public class DesignGenerationService {
    private final LLMProvider llm;
    private final PromptBuilder prompts;
    private final ObjectMapper objectMapper;
    private final CapacityEstimator estimator;
    private final ArchitectureValidator architectureValidator;
    private final PromptInjectionGuard injectionGuard;

    public DesignGenerationService(LLMProvider llm, PromptBuilder prompts, ObjectMapper objectMapper,
            CapacityEstimator estimator, ArchitectureValidator architectureValidator, PromptInjectionGuard injectionGuard) {
        this.llm = llm; this.prompts = prompts; this.objectMapper = objectMapper; this.estimator = estimator;
        this.architectureValidator = architectureValidator; this.injectionGuard = injectionGuard;
    }

    public GeneratedDesign generate(GenerationRequest request, Consumer<GenerationEvent> events) {
        injectionGuard.validate(request.problemDescription() + "\n" + request.additionalRequirements());
        if (!llm.isAvailable()) throw new IllegalStateException("Gemini is not configured.");

        events.accept(GenerationEvent.started("requirements"));
        RequirementsAnalysis requirements = parse(llm.generateStructured(
                prompts.requirementsSystem(), prompts.requirementsUser(request), prompts.requirementsSchema()), RequirementsAnalysis.class);
        validateRequirements(requirements);
        events.accept(GenerationEvent.completed("requirements", requirements));

        events.accept(GenerationEvent.started("estimation"));
        CapacityEstimate estimate = estimator.calculate(new CapacityEstimateRequest(
                request.dailyActiveUsers(), request.requestsPerUser(), request.peakMultiplier(),
                request.readRatio(), request.averagePayloadBytes()));
        events.accept(GenerationEvent.completed("estimation", estimate));

        events.accept(GenerationEvent.started("architecture"));
        ArchitectureDraft architecture = architectureValidator.validate(parse(llm.generateStructured(
                prompts.architectureSystem(), prompts.architectureUser(request, requirements, estimate),
                prompts.architectureSchema()), ArchitectureDraft.class));
        events.accept(GenerationEvent.completed("architecture", architecture));

        return new GeneratedDesign(request.systemName(), requirements, estimate, architecture);
    }

    private <T> T parse(String json, Class<T> type) {
        try { return objectMapper.readValue(json, type); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("AI returned invalid structured output.", e); }
    }

    private void validateRequirements(RequirementsAnalysis value) {
        if (value == null || value.functional() == null || value.functional().isEmpty()
                || value.nonFunctional() == null || value.nonFunctional().isEmpty())
            throw new IllegalArgumentException("AI requirements output is incomplete.");
    }
}
