"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calculator, Check, Circle, LoaderCircle, Sparkles, X } from "lucide-react";
import { streamDesignGeneration } from "@/lib/api";
import { GenerationEvent, SavedDesign } from "@/lib/domain/design";
import { browserStorage } from "@/lib/storage/storage-service";

const stages = [
  ["requirements", "Analyzing requirements"],
  ["estimation", "Calculating traffic"],
  ["architecture", "Designing architecture"],
] as const;
type StageState = "pending" | "active" | "complete" | "failed";

export default function DesignPage() {
  const { id } = useParams<{ id: string }>();
  const [design, setDesign] = useState<SavedDesign>();
  const [progress, setProgress] = useState<Record<string, StageState>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const controller = useRef<AbortController>();
  useEffect(() => setDesign(browserStorage().getDesign(id)), [id]);
  useEffect(() => () => controller.current?.abort(), []);

  const metrics = useMemo(() => design ? [
    ["Daily requests", design.estimate?.dailyRequests], ["Average RPS", design.estimate?.averageRps],
    ["Peak RPS", design.estimate?.peakRps], ["Target latency", `${design.input.expectedLatencyMs} ms`],
  ] : [], [design]);

  function receive(event: GenerationEvent) {
    if (event.type === "stage.started") setProgress((old) => ({ ...old, [event.stage]: "active" }));
    if (event.type === "stage.completed") setProgress((old) => ({ ...old, [event.stage]: "complete" }));
    if (event.type === "stage.failed") setProgress((old) => ({ ...old, [event.stage]: "failed" }));
  }

  async function generate() {
    if (!design || generating) return;
    setGenerating(true); setError(undefined); setProgress({});
    controller.current = new AbortController();
    try {
      const generatedDesign = await streamDesignGeneration(design.input, receive, controller.current.signal);
      const updated: SavedDesign = { ...design, status: "generated", updatedAt: new Date().toISOString(), generatedDesign };
      browserStorage().saveDesign(updated); setDesign(updated);
    } catch (cause) {
      if ((cause as Error).name !== "AbortError") setError(cause instanceof Error ? cause.message : "AI generation failed.");
    } finally { setGenerating(false); }
  }

  if (!design) return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-[var(--muted)]">Loading local design…</p></main>;
  const architecture = design.generatedDesign?.architecture;
  return <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
    <a href="/design/new" className="flex min-h-11 items-center gap-2 text-sm text-[var(--muted)]"><ArrowLeft size={17}/> New design</a>
    <header className="mt-8 flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-8 md:flex-row md:items-end"><div><span className="text-sm font-semibold text-[var(--accent)]">{design.status === "generated" ? "Generated design" : "Local draft"}</span><h1 className="my-2 text-4xl tracking-tight">{design.input.systemName}</h1><p className="m-0 max-w-2xl text-[var(--muted)]">{design.input.problemDescription}</p></div><div className="flex gap-2">{generating&&<button onClick={()=>controller.current?.abort()} className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] px-4"><X size={17}/> Cancel</button>}<button onClick={generate} disabled={generating} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 font-semibold text-white disabled:opacity-60">{generating?<><LoaderCircle className="animate-spin" size={18}/> Generating</>:<><Sparkles size={18}/> {design.status === "generated" ? "Regenerate" : "Generate architecture"}</>}</button></div></header>

    {generating&&<section className="my-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5" aria-live="polite"><h2 className="mt-0 text-base">Building your system design</h2><div className="grid gap-3 md:grid-cols-3">{stages.map(([key,label])=>{const state=progress[key]??"pending";return <div key={key} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--canvas)] p-4">{state==="complete"?<Check className="text-green-600" size={18}/>:state==="active"?<LoaderCircle className="animate-spin text-[var(--accent)]" size={18}/>:state==="failed"?<X className="text-red-600" size={18}/>:<Circle className="text-[var(--muted)]" size={18}/>}<span className="text-sm font-semibold">{label}</span></div>})}</div></section>}
    {error&&<p role="alert" className="my-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{error}</p>}

    <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label,value])=><div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><Calculator size={18} className="text-[var(--accent)]"/><p className="mb-1 mt-5 text-sm text-[var(--muted)]">{label}</p><b className="text-2xl">{typeof value==="number"?value.toLocaleString():value}</b></div>)}</section>

    {architecture&&<section className="mb-8 rounded-xl border border-[var(--border)] p-6"><div className="flex items-end justify-between"><div><p className="m-0 text-sm text-[var(--accent)]">Validated structured output</p><h2 className="mb-0 mt-1">Architecture components</h2></div><span className="text-sm text-[var(--muted)]">{architecture.nodes.length} nodes · {architecture.edges.length} connections</span></div><div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{architecture.nodes.map(node=><article key={node.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex items-start justify-between gap-3"><b>{node.name}</b><span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-xs text-[var(--accent)]">{node.type}</span></div><p className="mb-2 text-sm text-[var(--muted)]">{node.description}</p><small>{node.technology}</small></article>)}</div></section>}

    <section className="rounded-xl border border-[var(--border)] p-6"><h2 className="mt-0">Calculation formulas</h2><div className="grid gap-3 md:grid-cols-2">{Object.entries(design.estimate?.formulas??{}).map(([name,formula])=><div key={name} className="rounded-lg bg-[var(--surface)] p-4"><b className="text-sm">{name}</b><code className="mt-2 block text-sm text-[var(--muted)]">{formula}</code></div>)}</div></section>
  </main>;
}
