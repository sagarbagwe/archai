package com.archai.estimation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CapacityEstimator {
    private static final BigDecimal SECONDS_PER_DAY = BigDecimal.valueOf(86_400);
    private static final int SCALE = 2;

    public CapacityEstimate calculate(CapacityEstimateRequest request) {
        BigDecimal dailyRequests = BigDecimal.valueOf(request.dailyActiveUsers())
                .multiply(BigDecimal.valueOf(request.requestsPerUser()));
        BigDecimal averageRps = dailyRequests.divide(SECONDS_PER_DAY, SCALE, RoundingMode.HALF_UP);
        BigDecimal peakRps = averageRps.multiply(request.peakMultiplier()).setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal readRps = peakRps.multiply(request.readRatio()).setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal writeRps = peakRps.subtract(readRps).setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal bandwidth = peakRps.multiply(BigDecimal.valueOf(request.averagePayloadBytes())).setScale(SCALE, RoundingMode.HALF_UP);

        Map<String, String> formulas = new LinkedHashMap<>();
        formulas.put("dailyRequests", request.dailyActiveUsers() + " × " + request.requestsPerUser());
        formulas.put("averageRps", dailyRequests.toPlainString() + " ÷ 86,400");
        formulas.put("peakRps", averageRps.toPlainString() + " × " + request.peakMultiplier());
        formulas.put("readRps", peakRps.toPlainString() + " × " + request.readRatio());
        formulas.put("writeRps", peakRps.toPlainString() + " − " + readRps.toPlainString());
        formulas.put("peakBandwidthBytesPerSecond", peakRps.toPlainString() + " × " + request.averagePayloadBytes());

        return new CapacityEstimate(dailyRequests, averageRps, peakRps, readRps, writeRps, bandwidth, formulas);
    }
}
