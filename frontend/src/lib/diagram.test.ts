import { describe, expect, it } from "vitest";
import { buildInitialDiagram, validateDiagramReferences } from "./diagram";

const node = (id: string) => ({
  id, name: id, type: "Service", technology: "Java", description: "Service",
  responsibilities: ["Process requests"], scalingStrategy: "Horizontal",
});

describe("diagram utilities", () => {
  it("creates deterministic positions and valid connections", () => {
    const diagram = buildInitialDiagram({ nodes: [node("api"), node("db")], edges: [{ id: "e1", source: "api", target: "db", label: "SQL" }] });
    expect(diagram.nodes[1].position).toEqual({ x: 300, y: 0 });
    expect(validateDiagramReferences(diagram)).toBe(true);
  });

  it("detects unknown edge references", () => {
    const diagram = buildInitialDiagram({ nodes: [node("api")], edges: [] });
    diagram.edges.push({ id: "broken", source: "api", target: "missing" });
    expect(validateDiagramReferences(diagram)).toBe(false);
  });
});
