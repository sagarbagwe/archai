package com.archai.design;

import com.archai.architecture.ArchitectureDraft;
import com.archai.estimation.CapacityEstimate;

public record GeneratedDesign(
        String title,
        RequirementsAnalysis requirements,
        CapacityEstimate estimation,
        ArchitectureDraft architecture) {}
