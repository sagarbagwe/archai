package com.archai.controller;

import com.archai.estimation.CapacityEstimate;
import com.archai.estimation.CapacityEstimateRequest;
import com.archai.estimation.CapacityEstimator;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estimation")
public class EstimationController {
    private final CapacityEstimator estimator;

    public EstimationController(CapacityEstimator estimator) {
        this.estimator = estimator;
    }

    @PostMapping("/calculate")
    public CapacityEstimate calculate(@Valid @RequestBody CapacityEstimateRequest request) {
        return estimator.calculate(request);
    }
}
