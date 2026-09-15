package com.archai.estimation;

import java.math.BigDecimal;
import java.util.Map;

public record CapacityEstimate(
        BigDecimal dailyRequests,
        BigDecimal averageRps,
        BigDecimal peakRps,
        BigDecimal readRps,
        BigDecimal writeRps,
        BigDecimal peakBandwidthBytesPerSecond,
        Map<String, String> formulas) {}
