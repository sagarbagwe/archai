package com.archai.exception;

import java.time.Instant;
import java.util.List;

public record ApiError(String error, String message, List<FieldError> fields, Instant timestamp) {
    public record FieldError(String field, String message) {}
}
