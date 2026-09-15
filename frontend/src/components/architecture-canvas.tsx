"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEdge, Background, Controls, Handle, MiniMap, Panel, Position, ReactFlow,
  useEdgesState, useNodesState, type Connection, type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { ArchitectureComponent, DiagramState, diagramSchema } from "@/lib/domain/design";
import { validateDiagramReferences } from "@/lib/diagram";

type ArchitectureFlowNode = Node<ArchitectureComponent, "architecture">;

function ArchitectureCard({ data, selected }: NodeProps<ArchitectureFlowNode>) {
  return <div className={`w-60 rounded-lg border bg-[var(--canvas)] p-4 shadow-sm ${selected ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)]"}`}>
    <Handle type="target" position={Position.Left} className="!size-3 !border-2 !border-[var(--canvas)] !bg-[var(--accent)]" />
    <div className="flex items-start justify-between gap-3"><b className="text-sm">{data.name}</b><span className="rounded bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">{data.type}</span></div>
    <p className="mb-0 mt-3 text-xs text-[var(--muted)]">{data.technology || "Technology not set"}</p>
    <Handle type="source" position={Position.Right} className="!size-3 !border-2 !border-[var(--canvas)] !bg-[var(--accent)]" />
  </div>;
}

const nodeTypes = { architecture: ArchitectureCard };

export function ArchitectureCanvas({ diagram, onSave }: { diagram: DiagramState; onSave: (diagram: DiagramState) => void }) {
  const initialNodes = diagram.nodes as ArchitectureFlowNode[];
  const initialEdges = diagram.edges as Edge[];
  const [nodes, setNodes, onNodesChange] = useNodesState<ArchitectureFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId), [nodes, selectedId]);

  const connect = useCallback((connection: Connection) => {
    setEdges((current) => addEdge({ ...connection, id: `edge-${crypto.randomUUID()}`, label: "request" }, current));
  }, [setEdges]);

  const save = useCallback(() => {
    const next = diagramSchema.parse({
      nodes: nodes.map((node) => ({ id: node.id, type: "architecture", position: node.position, data: node.data })),
      edges: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, label: typeof edge.label === "string" ? edge.label : undefined })),
    });
    if (!validateDiagramReferences(next)) { setNotice("Fix invalid connections before saving."); return; }
    onSave(next); setNotice("Diagram saved locally.");
  }, [edges, nodes, onSave]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); save(); }
      if (event.key === "Escape") setSelectedId(undefined);
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [save]);

  function addNode() {
    const id = `service-${crypto.randomUUID().slice(0, 8)}`;
    setNodes((current) => [...current, {
      id, type: "architecture", position: { x: 80 + current.length * 24, y: 80 + current.length * 24 },
      data: { id, name: "New Service", type: "Service", technology: "", description: "", responsibilities: [], scalingStrategy: "Horizontal" },
    }]);
    setSelectedId(id); setNotice(undefined);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setNodes((current) => current.filter((node) => node.id !== selectedId));
    setEdges((current) => current.filter((edge) => edge.source !== selectedId && edge.target !== selectedId));
    setSelectedId(undefined); setNotice(undefined);
  }

  function updateSelected(patch: Partial<ArchitectureComponent>) {
    setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, data: { ...node.data, ...patch } } : node));
    setNotice(undefined);
  }

  return <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
    <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center">
      <div><p className="m-0 text-sm font-semibold">Interactive architecture</p><p className="m-0 text-xs text-[var(--muted)]">Drag nodes, connect handles, and select a component to edit it.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={addNode} className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--canvas)] px-3 text-sm font-semibold"><Plus size={16}/> Add node</button><button onClick={save} className="flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white"><Save size={16}/> Save diagram</button></div>
    </div>
    {notice&&<p className="m-0 border-b border-[var(--border)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent)]" role="status">{notice}</p>}
    <div className="relative h-[620px]">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} onNodeClick={(_,node)=>setSelectedId(node.id)} onPaneClick={()=>setSelectedId(undefined)} fitView fitViewOptions={{ padding: 0.25 }} minZoom={0.2} maxZoom={1.8}>
        <Background gap={24} size={1}/><MiniMap pannable zoomable nodeColor="var(--accent)" maskColor="color-mix(in srgb, var(--surface) 82%, transparent)"/><Controls position="bottom-left"/>
        <Panel position="top-left" className="rounded-md border border-[var(--border)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--muted)]">Ctrl/Cmd + S to save</Panel>
      </ReactFlow>
      {selected&&<aside className="absolute inset-y-0 right-0 z-10 w-full overflow-y-auto border-l border-[var(--border)] bg-[var(--canvas)] p-5 shadow-xl sm:w-96">
        <div className="flex items-center justify-between"><div><p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Component details</p><h3 className="mb-0 mt-1">{selected.data.name}</h3></div><button onClick={()=>setSelectedId(undefined)} aria-label="Close component details" className="grid size-11 place-items-center rounded-lg hover:bg-[var(--surface)]"><X size={18}/></button></div>
        <div className="mt-6 grid gap-4">{[
          ["Name","name",selected.data.name], ["Type","type",selected.data.type], ["Technology","technology",selected.data.technology], ["Scaling strategy","scalingStrategy",selected.data.scalingStrategy],
        ].map(([label,key,value])=><label key={key} className="text-sm font-semibold">{label}<input value={String(value??"")} onChange={event=>updateSelected({[key]:event.target.value})} className="mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"/></label>)}
          <label className="text-sm font-semibold">Description<textarea value={selected.data.description} onChange={event=>updateSelected({description:event.target.value})} className="mt-2 min-h-28 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 font-normal"/></label>
          <label className="text-sm font-semibold">Responsibilities<textarea value={selected.data.responsibilities.join("\n")} onChange={event=>updateSelected({responsibilities:event.target.value.split("\n").filter(Boolean)})} className="mt-2 min-h-28 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 font-normal" placeholder="One responsibility per line"/></label>
        </div>
        <button onClick={deleteSelected} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600"><Trash2 size={16}/> Delete component</button>
      </aside>}
    </div>
  </section>;
}
