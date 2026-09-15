package com.archai.architecture;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class ArchitectureValidatorTest {
    private final ArchitectureValidator validator = new ArchitectureValidator();

    @Test
    void rejectsEdgesWithUnknownNodes() {
        ArchitectureNode client = new ArchitectureNode("client", "Client", "Client", "Browser", "Entry point", List.of("Send requests"), "N/A");
        ArchitectureDraft draft = new ArchitectureDraft(List.of(client), List.of(new ArchitectureEdge("e1", "client", "missing", "HTTPS")));
        assertThatThrownBy(() -> validator.validate(draft)).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("unknown node");
    }
}
