"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calculator, Save } from "lucide-react";
import { calculateEstimate } from "@/lib/api";
import { DesignInput, designInputSchema, SavedDesign } from "@/lib/domain/design";
import { browserStorage } from "@/lib/storage/storage-service";

const defaults: DesignInput = {
  systemName: "Global Payment Processing Platform",
  problemDescription: "Design a globally available payment platform that safely processes high transaction volume.",
  dailyActiveUsers: 10_000_000, requestsPerUser: 20, peakMultiplier: 5,
  availability: "99.99%", expectedLatencyMs: 200, geographicScope: "Global",
  consistency: "Strong", dataRetention: "5 years",
  additionalRequirements: "Refunds, idempotency, fraud detection, audit logs, and multi-region availability.",
  difficulty: "FAANG-level",
};

export function NewDesignForm() {
  const router = useRouter();
  const [form, setForm] = useState(defaults);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const set = <K extends keyof DesignInput>(key: K, value: DesignInput[K]) => setForm((old) => ({ ...old, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(undefined);
    const parsed = designInputSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the form fields."); return; }
    setSubmitting(true);
    try {
      const estimate = await calculateEstimate(parsed.data);
      const now = new Date().toISOString();
      const design: SavedDesign = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, status: "draft", input: parsed.data, estimate };
      const persisted = browserStorage().saveDesign(design);
      if (!persisted) setError("Browser persistence is unavailable; this design is temporary.");
      router.push(`/design/${design.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create design."); setSubmitting(false); }
  }

  const field = "mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--canvas)] px-3 text-[var(--text)]";
  const label = "text-sm font-semibold";
  return <form onSubmit={submit} className="mx-auto max-w-5xl px-6 pb-20">
    <div className="mb-8 flex items-center justify-between"><a href="/" className="flex min-h-11 items-center gap-2 text-sm text-[var(--muted)]"><ArrowLeft size={17}/> Back</a><span className="text-sm text-[var(--muted)]">Draft saves locally after calculation</span></div>
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="m-0 text-3xl tracking-tight">Create a system design</h1><p className="text-[var(--muted)]">Define scale and quality targets before AI architecture generation.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className={`${label} sm:col-span-2`}>System name<input className={field} value={form.systemName} onChange={e=>set("systemName",e.target.value)} maxLength={120}/></label>
          <label className={`${label} sm:col-span-2`}>Problem description<textarea className={`${field} min-h-32 py-3`} value={form.problemDescription} onChange={e=>set("problemDescription",e.target.value)} maxLength={5000}/></label>
          <label className={label}>Daily active users<input type="number" className={field} value={form.dailyActiveUsers} onChange={e=>set("dailyActiveUsers",Number(e.target.value))}/></label>
          <label className={label}>Requests per user<input type="number" className={field} value={form.requestsPerUser} onChange={e=>set("requestsPerUser",Number(e.target.value))}/></label>
          <label className={label}>Peak traffic multiplier<input type="number" step="0.1" className={field} value={form.peakMultiplier} onChange={e=>set("peakMultiplier",Number(e.target.value))}/></label>
          <label className={label}>Availability<select className={field} value={form.availability} onChange={e=>set("availability",e.target.value as DesignInput["availability"])}>{["99%","99.9%","99.99%","99.999%"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className={label}>Expected latency (ms)<input type="number" className={field} value={form.expectedLatencyMs} onChange={e=>set("expectedLatencyMs",Number(e.target.value))}/></label>
          <label className={label}>Geographic scope<select className={field} value={form.geographicScope} onChange={e=>set("geographicScope",e.target.value as DesignInput["geographicScope"])}>{["Single Region","Multi Region","Global"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className={label}>Consistency<select className={field} value={form.consistency} onChange={e=>set("consistency",e.target.value as DesignInput["consistency"])}>{["Strong","Eventual","Mixed","Let AI decide"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className={label}>Data retention<input className={field} value={form.dataRetention} onChange={e=>set("dataRetention",e.target.value)}/></label>
          <label className={`${label} sm:col-span-2`}>Additional requirements<textarea className={`${field} min-h-24 py-3`} value={form.additionalRequirements} onChange={e=>set("additionalRequirements",e.target.value)} maxLength={3000}/></label>
          <label className={label}>Interview difficulty<select className={field} value={form.difficulty} onChange={e=>set("difficulty",e.target.value as DesignInput["difficulty"])}>{["Beginner","Intermediate","Advanced","FAANG-level"].map(x=><option key={x}>{x}</option>)}</select></label>
        </div>
        {error&&<p role="alert" className="mt-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 font-semibold text-white disabled:opacity-60">{submitting?<><Calculator size={18}/> Calculating capacity…</>:<><Save size={18}/> Create draft <ArrowRight size={18}/></>}</button>
      </section>
      <aside className="h-fit rounded-xl border border-[var(--border)] p-5"><h2 className="m-0 text-base">What happens next</h2><ol className="mt-4 space-y-4 pl-5 text-sm text-[var(--muted)]"><li>Inputs are validated.</li><li>Java calculates traffic deterministically.</li><li>The draft is saved in your browser.</li><li>AI generation will use these verified numbers.</li></ol><div className="mt-6 rounded-lg bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent)]"><b>No account or database.</b><br/>Your design stays in this browser.</div></aside>
    </div>
  </form>;
}
