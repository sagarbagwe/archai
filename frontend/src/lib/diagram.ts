import { ArchitectureConnection, ArchitectureComponent, DiagramState } from "./domain/design";

export function buildInitialDiagram(architecture: { nodes: ArchitectureComponent[]; edges: ArchitectureConnection[] }): DiagramState {
  const columns = architecture.nodes.length > 8 ? 4 : 3;
  return {
    nodes: architecture.nodes.map((component, index) => ({
      id: component.id,
      type: "architecture" as const,
      position: { x: (index % columns) * 300, y: Math.floor(index / columns) * 190 },
      data: component,
    })),
    edges: architecture.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, label: edge.label })),
  };
}

export function validateDiagramReferences(diagram: DiagramState): boolean {
  const nodeIds = new Set(diagram.nodes.map((node) => node.id));
  return nodeIds.size === diagram.nodes.length
    && diagram.edges.every((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
}
