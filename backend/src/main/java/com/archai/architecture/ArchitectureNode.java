package com.archai.architecture;

import java.util.List;

public record ArchitectureNode(
        String id, String name, String type, String technology,
        String description, List<String> responsibilities, String scalingStrategy) {}
