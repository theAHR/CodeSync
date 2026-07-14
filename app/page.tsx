"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoomId } from "@/lib/create-id";
import { assetPath } from "@/lib/paths";
import { LanShareBox } from "@/components/ui/LanShareBox";

const FEATURES = [
  {
    title: "CRDT Sync",
    desc: "Conflict-free merging with Yjs ΓÇö like Google Docs for code.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
    color: "violet",
  },
  {
    title: "Live Cursors",
    desc: "See where everyone is typing with colored cursors.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 12H18M7.757 14.743l-1.59 1.59M6 12H4.5m2.92-7.257-1.59-1.59M12 18.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
      </svg>
    ),
    color: "cyan",
  },
  {
    title: "Multi-file",
    desc: "Tabbed HTML, CSS, and JS files in one project.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    color: "emerald",
  },
  {
    title: "Chat & Voice",
    desc: "Text chat and WebRTC voice built into every room.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
    color: "rose",
  },
  {
    title: "Versions",
    desc: "Save snapshots and restore any previous state.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    color: "amber",
  },
  {
    title: "Persistence",
    desc: "Room state auto-saves ΓÇö survives page refresh.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    color: "sky",
  },
] as const;

const FEATURE_COLORS: Record<string, { icon: string; bg: string; border: string }> = {
  violet: { icon: "text-violet-400", bg: "bg-violet-500/10", border: "group-hover:border-violet-500/30" },
  cyan: { icon: "text-cyan-400", bg: "bg-cyan-500/10", border: "group-hover:border-cyan-500/30" },
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/30" },
  rose: { icon: "text-rose-400", bg: "bg-rose-500/10", border: "group-hover:border-rose-500/30" },
  amber: { icon: "text-amber-400", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/30" },
  sky: { icon: "text-sky-400", bg: "bg-sky-500/10", border: "group-hover:border-sky-500/30" },
};

const STEPS = [
  { num: "01", title: "Create a room", desc: "One click ΓÇö no account needed." },
  { num: "02", title: "Share the link", desc: "Send the URL to your teammates." },
  { num: "03", title: "Code together", desc: "Edit, chat, and preview in real time." },
];

function EditorMockup() {
  return (
    <div className="landing-float relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 shadow-2xl shadow-black/50 backdrop-blur-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
          </div>
          <div className="ml-3 flex gap-1">
            {["index.html", "styles.css", "script.js"].map((tab, i) => (
              <span
                key={tab}
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] ${
                  i === 0
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-600"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Editor pane */}
          <div className="flex-1 border-r border-zinc-800 p-4 font-mono text-[11px] leading-relaxed">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-500">3 online</span>
            </div>
            <div className="space-y-1 text-zinc-500">
              <p><span className="text-violet-400">&lt;!DOCTYPE</span> html&gt;</p>
              <p><span className="text-violet-400">&lt;html&gt;</span></p>
              <p className="pl-4"><span className="text-violet-400">&lt;body&gt;</span></p>
              <p className="pl-8">
                <span className="text-amber-300/80">&lt;h1&gt;</span>
                <span className="text-zinc-300">Hello, </span>
                <span className="relative">
                  <span className="text-zinc-300">team!</span>
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-cyan-400/60" />
                </span>
                <span className="text-amber-300/80">&lt;/h1&gt;</span>
              </p>
              <p className="pl-4"><span className="text-violet-400">&lt;/body&gt;</span></p>
              <p><span className="text-violet-400">&lt;/html&gt;</span></p>
            </div>
            {/* Remote cursors */}
            <div className="mt-4 flex gap-3">
              <div className="flex items-center gap-1">
                <div className="h-3 w-0.5 bg-violet-400" />
                <span className="rounded bg-violet-500/80 px-1 text-[9px] text-white">Alex</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-0.5 bg-cyan-400" />
                <span className="rounded bg-cyan-500/80 px-1 text-[9px] text-white">Sam</span>
              </div>
            </div>
          </div>

          {/* Preview pane */}
          <div className="hidden w-36 shrink-0 bg-white p-3 sm:block">
            <p className="text-center text-sm font-bold text-zinc-800">Hello, team!</p>
            <div className="mt-2 h-1 w-full rounded bg-violet-200" />
            <div className="mt-1 h-1 w-2/3 rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");

  const createRoom = () => {
    const roomId = createRoomId();
    router.push(`/room?id=${roomId}`);
  };

  const joinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = joinId.trim();
    if (!trimmed) return;
    router.push(`/room?id=${trimmed}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 landing-grid-bg" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[100px]" style={{ animation: "pulse-glow 8s ease-in-out infinite" }} />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[100px]" style={{ animation: "pulse-glow 10s ease-in-out infinite 2s" }} />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[80px]" />
      </div>

      {/* Nav */}
      <header className="landing-fade-in relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image
            src={assetPath("/icon.png")}
            alt="CodeSync"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-violet-600/25"
            unoptimized
          />
          <span className="text-lg font-semibold tracking-tight text-zinc-100">CodeSync</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-500">
            No login required
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-500">
            Real-time sync
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        {/* Hero */}
        <section className="grid items-center gap-12 pt-8 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div>
            <div className="landing-fade-in-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-violet-300">
                Real-time collaborative editing
              </span>
            </div>

            <h1 className="landing-fade-in-delay-2 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Code together,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                instantly
              </span>
            </h1>

            <p className="landing-fade-in-delay-3 mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
              A minimal CodeSandbox Live experience. Multiple people, one document,
              zero conflicts ΓÇö powered by CRDTs.
            </p>

            <div className="landing-fade-in-delay-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={createRoom}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform group-hover:rotate-90" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create new room
              </button>
              <p className="text-sm text-zinc-600">
                or join an existing one below
              </p>
            </div>

            <form
              onSubmit={joinRoom}
              className="landing-fade-in-delay-4 mt-5 flex w-full max-w-md gap-2"
            >
              <div className="relative min-w-0 flex-1">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <input
                  type="text"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Paste room ID to join"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none ring-violet-500/0 backdrop-blur-sm transition-all placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={!joinId.trim()}
                className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-3 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Join
              </button>
            </form>

            <div className="landing-fade-in-delay-4">
              <LanShareBox />
            </div>
          </div>

          <div className="landing-fade-in-delay-3 hidden lg:block">
            <EditorMockup />
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 text-center backdrop-blur-sm transition-colors hover:border-zinc-700/80 hover:bg-zinc-900/50"
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-4 translate-x-full bg-gradient-to-r from-zinc-700 to-transparent sm:block" />
                )}
                <span className="font-mono text-2xl font-bold text-zinc-700 transition-colors group-hover:text-violet-500/60">
                  {step.num}
                </span>
                <h3 className="mt-2 text-base font-semibold text-zinc-200">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Everything you need to pair program
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-500">
              Built with Yjs, Monaco, and Sandpack ΓÇö the same stack powering modern collaborative tools.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const colors = FEATURE_COLORS[feature.color];
              return (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 backdrop-blur-sm transition-all hover:bg-zinc-900/50 ${colors.border}`}
                >
                  <div className={`inline-flex rounded-lg p-2.5 ${colors.bg} ${colors.icon}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech stack */}
        <section className="mt-20">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-zinc-800/40 bg-zinc-900/20 px-8 py-5 backdrop-blur-sm">
            {["Next.js", "Yjs", "Monaco", "Sandpack", "WebRTC", "Tailwind"].map((tech) => (
              <span key={tech} className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-20 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-zinc-100">Ready to collaborate?</h2>
            <p className="mt-2 text-zinc-500">
              Open two tabs with the same room URL to see real-time sync in action.
            </p>
            <button
              type="button"
              onClick={createRoom}
              className="mt-6 rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 active:scale-[0.98]"
            >
              Start coding now
            </button>
          </div>
          <p className="mt-8 text-xs text-zinc-600">
            No login required · Live sync · Open two tabs to try it
          </p>
        </section>

        {/* Built by */}
        <section className="mt-16 pb-4">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Built by
          </p>
          <a
            href="https://github.com/theahr"
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto mt-4 flex max-w-md items-center justify-between gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-5 py-4 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={assetPath("/me.png")}
                alt="Amir Ramroudi"
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full border border-zinc-700 object-cover"
                unoptimized
              />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-zinc-100">
                  Amir Ramroudi
                </p>
                <p className="truncate text-xs text-sky-400">@theAHR</p>
              </div>
            </div>
            <span className="shrink-0 text-xs text-zinc-500 transition-colors group-hover:text-zinc-300">
              View on GitHub ΓåÆ
            </span>
          </a>
        </section>
      </main>
    </div>
  );
}
