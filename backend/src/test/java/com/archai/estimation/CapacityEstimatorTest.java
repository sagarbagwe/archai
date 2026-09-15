package com.archai.estimation;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CapacityEstimatorTest {
    private final CapacityEstimator estimator = new CapacityEstimator();

    @Test
    void calculatesPaymentDemoTraffic() {
        CapacityEstimate result = estimator.calculate(new CapacityEstimateRequest(
                10_000_000L, 20L, new BigDecimal("5"), new BigDecimal("0.80"), 1_024L));

        assertThat(result.dailyRequests()).isEqualByComparingTo("200000000");
        assertThat(result.averageRps()).isEqualByComparingTo("2314.81");
        assertThat(result.peakRps()).isEqualByComparingTo("11574.05");
        assertThat(result.readRps()).isEqualByComparingTo("9259.24");
        assertThat(result.writeRps()).isEqualByComparingTo("2314.81");
    }
}
