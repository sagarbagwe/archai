"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calculator, Sparkles } from "lucide-react";
import { SavedDesign } from "@/lib/domain/design";
import { browserStorage } from "@/lib/storage/storage-service";

export default function DesignPage() {
  const { id } = useParams<{ id: string }>();
  const [design, setDesign] = useState<SavedDesign>();
  useEffect(() => setDesign(browserStorage().getDesign(id)), [id]);
  if (!design) return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-[var(--muted)]">Loading local design…</p></main>;
  const metrics = [
    ["Daily requests", design.estimate?.dailyRequests], ["Average RPS", design.estimate?.averageRps],
    ["Peak RPS", design.estimate?.peakRps], ["Target latency", `${design.input.expectedLatencyMs} ms`],
  ];
  return <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
    <a href="/design/new" className="flex min-h-11 items-center gap-2 text-sm text-[var(--muted)]"><ArrowLeft size={17}/> New design</a>
    <header className="mt-8 flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-8 md:flex-row md:items-end"><div><span className="text-sm font-semibold text-[var(--accent)]">Local draft</span><h1 className="my-2 text-4xl tracking-tight">{design.input.systemName}</h1><p className="m-0 max-w-2xl text-[var(--muted)]">{design.input.problemDescription}</p></div><button className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 font-semibold text-white"><Sparkles size={18}/> Generate architecture</button></header>
    <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label,value])=><div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><Calculator size={18} className="text-[var(--accent)]"/><p className="mb-1 mt-5 text-sm text-[var(--muted)]">{label}</p><b className="text-2xl">{typeof value==="number"?value.toLocaleString():value}</b></div>)}</section>
    <section className="rounded-xl border border-[var(--border)] p-6"><h2 className="mt-0">Calculation formulas</h2><div className="grid gap-3 md:grid-cols-2">{Object.entries(design.estimate?.formulas??{}).map(([name,formula])=><div key={name} className="rounded-lg bg-[var(--surface)] p-4"><b className="text-sm">{name}</b><code className="mt-2 block text-sm text-[var(--muted)]">{formula}</code></div>)}</div></section>
  </main>;
}
