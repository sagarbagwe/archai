import { ArrowRight, Database, GitBranch, Sparkles } from "lucide-react";

const flow = ["Client", "CDN", "API Gateway", "Services", "Event Stream", "Databases"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex min-h-11 items-center gap-3 font-semibold"><GitBranch size={19}/> ArchAI</a>
        <div className="hidden gap-7 text-sm text-[var(--muted)] md:flex"><a href="#capabilities">Capabilities</a><a href="/examples">Examples</a><a href="/interview">Interview mode</a></div>
        <a href="/design/new" className="flex min-h-11 items-center gap-2 rounded-lg bg-[var(--text)] px-4 text-sm font-semibold text-[var(--canvas)]">New design <ArrowRight size={16}/></a>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted)]"><Sparkles size={15} className="text-[var(--accent)]"/> AI-assisted architecture workspace</span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">Design scalable systems with AI.</h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--muted)]">Generate production-grade system designs, explore architecture interactively, simulate failures, and practice system design interviews.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="/design/new" className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 font-semibold text-white">Create system design <ArrowRight size={18}/></a>
            <a href="/examples/payment-system" className="flex min-h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 font-semibold">Try payment example</a>
          </div>
          <div id="capabilities" className="mt-12 grid grid-cols-3 gap-5 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]"><span><b className="block text-[var(--text)]">Structured</b>Validated output</span><span><b className="block text-[var(--text)]">Interactive</b>Editable diagrams</span><span><b className="block text-[var(--text)]">Local-first</b>No account needed</span></div>
        </div>

        <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl shadow-black/5">
          <header className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4"><div><b className="text-sm">Global payment platform</b><p className="m-0 text-xs text-[var(--muted)]">Architecture preview</p></div><span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-xs text-[var(--accent)]">99.99% target</span></header>
          {flow.map((name,index)=><div key={name}><div className="flex min-h-14 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--canvas)] px-4"><span className="text-[var(--accent)]">{index===5?<Database size={17}/>:<GitBranch size={17}/>}</span><b className="flex-1 text-sm">{name}</b><small className="text-[var(--muted)]">0{index+1}</small></div>{index<flow.length-1&&<div className="mx-auto h-2 w-px bg-[var(--border)]"/>}</div>)}
        </aside>
      </section>
    </main>
  );
}
