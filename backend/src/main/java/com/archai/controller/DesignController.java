package com.archai.controller;

import com.archai.design.DesignGenerationService;
import com.archai.design.GeneratedDesign;
import com.archai.design.GenerationEvent;
import com.archai.design.GenerationRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/design")
public class DesignController {
    private final DesignGenerationService generationService;
    public DesignController(DesignGenerationService generationService) { this.generationService = generationService; }

    @PostMapping(path = "/generate/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generate(@Valid @RequestBody GenerationRequest request) {
        SseEmitter emitter = new SseEmitter(180_000L);
        Thread.startVirtualThread(() -> {
            try {
                GeneratedDesign design = generationService.generate(request, event -> send(emitter, event));
                send(emitter, new GenerationEvent("generation.completed", "complete", design));
                emitter.complete();
            } catch (Exception error) {
                send(emitter, GenerationEvent.failed("generation", safeMessage(error)));
                emitter.complete();
            }
        });
        return emitter;
    }

    private void send(SseEmitter emitter, GenerationEvent event) {
        try { emitter.send(SseEmitter.event().name(event.type()).data(event)); }
        catch (IOException error) { throw new IllegalStateException("Generation stream disconnected.", error); }
    }

    private String safeMessage(Exception error) {
        String message = error.getMessage();
        return message != null && (message.contains("configured") || message.contains("invalid") || message.contains("incomplete"))
                ? message : "AI generation is temporarily unavailable. Please try again.";
    }
}
