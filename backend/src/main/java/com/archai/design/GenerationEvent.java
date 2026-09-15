package com.archai.design;

public record GenerationEvent(String type, String stage, Object data) {
    public static GenerationEvent started(String stage) { return new GenerationEvent("stage.started", stage, null); }
    public static GenerationEvent completed(String stage, Object data) { return new GenerationEvent("stage.completed", stage, data); }
    public static GenerationEvent failed(String stage, String message) { return new GenerationEvent("stage.failed", stage, message); }
}
