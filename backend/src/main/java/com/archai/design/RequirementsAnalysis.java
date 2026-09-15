package com.archai.design;

import java.util.List;

public record RequirementsAnalysis(
        List<String> functional,
        List<String> nonFunctional,
        List<String> assumptions,
        List<String> constraints) {}
