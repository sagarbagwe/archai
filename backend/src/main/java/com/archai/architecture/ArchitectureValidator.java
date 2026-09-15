package com.archai.architecture;

import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class ArchitectureValidator {
    public ArchitectureDraft validate(ArchitectureDraft draft) {
        if (draft == null || draft.nodes() == null || draft.nodes().isEmpty())
            throw new IllegalArgumentException("Architecture must contain nodes.");
        if (draft.nodes().size() > 100) throw new IllegalArgumentException("Architecture exceeds 100 nodes.");
        Set<String> ids = new HashSet<>();
        draft.nodes().forEach(node -> {
            if (node.id() == null || node.id().isBlank() || !ids.add(node.id()))
                throw new IllegalArgumentException("Architecture node IDs must be unique and non-empty.");
        });
        if (draft.edges() != null) draft.edges().forEach(edge -> {
            if (!ids.contains(edge.source()) || !ids.contains(edge.target()))
                throw new IllegalArgumentException("Architecture edge references an unknown node.");
        });
        return draft;
    }
}
