package com.archai.estimation;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CapacityEstimateRequest(
        @Min(1) @Max(2_000_000_000L) long dailyActiveUsers,
        @Min(1) @Max(1_000_000) long requestsPerUser,
        @NotNull @DecimalMin("1.0") @DecimalMax("1000.0") BigDecimal peakMultiplier,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal readRatio,
        @Min(1) @Max(100_000_000) long averagePayloadBytes) {}
