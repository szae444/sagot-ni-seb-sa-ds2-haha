import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Kbd } from "./components/ui";
import { CHAPTERS, chapterById, REVIEWER_PDF } from "./content";
import { go, useProgress, useRoute, useTheme } from "./lib/store";
import { Home } from "./pages/Home";
import { Lab } from "./pages/Lab";
import { Practice } from "./pages/Practice";
import { Flashcards } from "./pages/Flashcards";
import { LESSONS } from "./pages/lessons";

const TOOLS = [
  { path: "/lab", name: "Matrix Lab", hint: "Type any matrix, get every step" },
  { path: "/practice", name: "Practice", hint: "Endless random problems" },
  { path: "/cards", name: "Flashcards", hint: "Formulas & rules to memorize" },
];

// ---------------------------------------------------------------- brand mark
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--red)" />
      <path d="M10 8H7v16h3M22 8h3v16h-3" stroke="var(--paper)" strokeWidth="2.4" fill="none" />
      <circle cx="16" cy="16" r="2.6" fill="var(--paper)" />
    </svg>
  );
}

// ---------------------------------------------------------------- navigation rail
function Rail({ route, onNavigate, onSearch }: { route: string; onNavigate?: () => void; onSearch: () => void }) {
  const { isDone, done } = useProgress();
  const { dark, toggle } = useTheme();
  const nav = (p: string) => { go(p); onNavigate?.(); };
  const pct = Math.round((done.filter((d) => chapterById(d)).length / CHAPTERS.length) * 100);
  return (
    <div className="flex h-full flex-col">
      <button type="button" onClick={() => nav("/")} className="group flex items-center gap-3 px-6 pt-7 pb-6 text-left">
        <Mark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
        <span className="leading-none">
          <span className="block font-display text-[23px] text-ink">Sagot ni Seb</span>
          <span className="mt-1 block font-mono text-[11px] tracking-[0.08em] text-ink-3">sa DS2 <i className="text-red-ink">haha</i></span>
        </span>
      </button>

      <button type="button" onClick={onSearch} className="mx-5 mb-5 flex items-center justify-between rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink-3 transition-colors hover:border-red">
        <span>Jump to…</span><span className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>
      </button>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">Chapters</div>
        <ul>
          {CHAPTERS.map((c) => {
            const active = route === `/learn/${c.id}`;
            return (
              <li key={c.id}>
                <button type="button" onClick={() => nav(`/learn/${c.id}`)}
                  className={`group relative flex w-full items-baseline gap-3 rounded-md px-3 py-[7px] text-left text-[14px] transition-colors ${active ? "bg-red-tint text-red-ink" : "text-ink-2 hover:text-ink"}`}>
                  {active && <motion.span layoutId="rail-mark" className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-red" />}
                  <span className={`w-5 shrink-0 font-mono text-[11px] ${active ? "text-red-ink" : "text-ink-3"}`}>{c.num}</span>
                  <span className="flex-1">{c.title}</span>
                  {isDone(c.id) && <span className="text-[12px] text-ok" title="Reviewed">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="px-3 pt-6 pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">Tools</div>
        <ul>
          {TOOLS.map((t) => {
            const active = route === t.path;
            return (
              <li key={t.path}>
                <button type="button" onClick={() => nav(t.path)}
                  className={`relative flex w-full items-baseline justify-between rounded-md px-3 py-[7px] text-left text-[14px] transition-colors ${active ? "bg-red-tint text-red-ink" : "text-ink-2 hover:text-ink"}`}>
                  {active && <motion.span layoutId="rail-mark" className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-red" />}
                  <span>{t.name}</span><span className="text-ink-3">→</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-line px-6 py-4">
        <div className="mb-1.5 flex justify-between font-mono text-[11px] text-ink-3"><span>reviewed</span><span>{pct}%</span></div>
        <div className="h-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-red transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={toggle} className="font-mono text-[12px] text-ink-2 hover:text-red-ink">{dark ? "☀ light" : "☾ dark"} mode</button>
          <a href={REVIEWER_PDF} target="_blank" rel="noreferrer" className="font-mono text-[12px] text-ink-2 hover:text-red-ink">PDF ↗</a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- command palette
function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [k, setK] = useState(0);
  const { toggle } = useTheme();
  const input = useRef<HTMLInputElement>(null);
  const items = useMemo(() => {
    const all = [
      { label: "Home", sub: "Start page", run: () => go("/") },
      ...CHAPTERS.map((c) => ({ label: `${c.num} · ${c.title}`, sub: c.blurb, run: () => go(`/learn/${c.id}`) })),
      ...TOOLS.map((t) => ({ label: t.name, sub: t.hint, run: () => go(t.path) })),
      { label: "Toggle dark mode", sub: "Switch the color theme", run: toggle },
    ];
    const s = q.toLowerCase().trim();
    return s ? all.filter((i) => (i.label + " " + i.sub).toLowerCase().includes(s)) : all;
  }, [q, toggle]);
  useEffect(() => { if (open) { setQ(""); setK(0); setTimeout(() => input.current?.focus(), 20); } }, [open]);
  useEffect(() => setK(0), [q]);
  const run = (i: number) => { items[i]?.run(); onClose(); };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[14vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chapters and tools…"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { setK((x) => Math.min(items.length - 1, x + 1)); e.preventDefault(); }
                if (e.key === "ArrowUp") { setK((x) => Math.max(0, x - 1)); e.preventDefault(); }
                if (e.key === "Enter") run(k);
                if (e.key === "Escape") onClose();
              }}
              className="w-full border-b border-line bg-transparent px-5 py-4 text-[16px] text-ink outline-none placeholder:text-ink-3" />
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {items.map((it, i) => (
                <li key={it.label}>
                  <button type="button" onMouseEnter={() => setK(i)} onClick={() => run(i)}
                    className={`w-full rounded-lg px-4 py-2.5 text-left ${i === k ? "bg-red-tint" : ""}`}>
                    <div className={`text-[14.5px] ${i === k ? "text-red-ink" : "text-ink"}`}>{it.label}</div>
                    <div className="truncate text-[12.5px] text-ink-3">{it.sub}</div>
                  </button>
                </li>
              ))}
              {!items.length && <li className="px-4 py-6 text-center text-[14px] text-ink-3">Nothing matches “{q}”.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------- chapter frame
function ChapterPage({ id }: { id: string }) {
  const c = chapterById(id);
  const { isDone, toggle } = useProgress();
  if (!c) return <NotFound />;
  const idx = CHAPTERS.indexOf(c);
  const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1];
  const Body = LESSONS[id];
  return (
    <article className="mx-auto max-w-[880px] px-5 pt-10 pb-24 sm:px-10 lg:pt-16">
      <header className="relative mb-12 border-b border-line pb-10">
        <div className="pointer-events-none absolute -top-6 right-0 select-none font-display text-[140px] leading-none text-red/10 sm:text-[200px]" aria-hidden>{c.num}</div>
        <div className="relative font-mono text-[12px] uppercase tracking-[0.16em] text-red-ink">
          Chapter {c.num} · {c.kind === "solve" ? "Solved problems" : "Lesson"} · <span className="text-ink-3">{c.slides}</span>
        </div>
        <h1 className="relative mt-4 font-display text-[46px] leading-[1.02] text-ink sm:text-[64px]">{c.title}</h1>
        <p className="relative mt-4 max-w-[52ch] text-[18px] leading-relaxed text-ink-2">{c.blurb}</p>
      </header>
      <Body />
      <footer className="mt-20 border-t border-line pt-8">
        <button type="button" onClick={() => toggle(c.id)}
          className={`mb-10 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-[14.5px] transition-all ${isDone(c.id) ? "border-ok bg-ok-soft text-ok" : "border-line-2 text-ink hover:border-red hover:text-red-ink"}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isDone(c.id) ? "border-ok bg-ok text-paper" : "border-ink-3"}`}>{isDone(c.id) ? "✓" : ""}</span>
          {isDone(c.id) ? "Reviewed. Nice one!" : "Mark this chapter as reviewed"}
        </button>
        <div className="grid gap-4 sm:grid-cols-2">
          {prev ? <NavCard dir="← Previous" c={prev} /> : <span />}
          {next ? <NavCard dir="Next →" c={next} right /> : <NavCard dir="Next →" c={{ id: "", num: "✦", title: "Practice time" }} right to="/practice" />}
        </div>
      </footer>
    </article>
  );
}
function NavCard({ dir, c, right, to }: { dir: string; c: { id: string; num: string; title: string }; right?: boolean; to?: string }) {
  return (
    <button type="button" onClick={() => go(to ?? `/learn/${c.id}`)}
      className={`group rounded-xl border border-line px-5 py-4 transition-colors hover:border-red ${right ? "text-right" : "text-left"}`}>
      <div className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">{dir}</div>
      <div className="mt-1 font-display text-[24px] text-ink transition-colors group-hover:text-red-ink">{c.num} {c.title}</div>
    </button>
  );
}
function NotFound() {
  return <div className="p-16"><h1 className="font-display text-[48px]">Page not found</h1><button type="button" className="mt-4 text-red-ink underline" onClick={() => go("/")}>Back home</button></div>;
}

// ---------------------------------------------------------------- app
export default function App() {
  const route = useRoute();
  const [pal, setPal] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  useEffect(() => setMenu(false), [route]);

  let page: ReactNode;
  if (route === "/") page = <Home />;
  else if (route.startsWith("/learn/")) page = <ChapterPage key={route} id={route.slice(7)} />;
  else if (route === "/lab") page = <Lab />;
  else if (route === "/practice") page = <Practice />;
  else if (route === "/cards") page = <Flashcards />;
  else page = <NotFound />;

  return (
    <MotionConfig reducedMotion="user">
    <div className="grain min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-line bg-paper-2/60 lg:block">
        <Rail route={route} onSearch={() => setPal(true)} />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <button type="button" onClick={() => go("/")} className="flex items-center gap-2"><Mark className="h-7 w-7" /><span className="font-display text-[20px]">Sagot ni Seb</span></button>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPal(true)} className="rounded-full border border-line-2 px-3 py-1.5 text-[13px]">Search</button>
          <button type="button" onClick={() => setMenu(true)} className="rounded-full bg-red px-3 py-1.5 text-[13px] text-paper">Menu</button>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/30" onClick={() => setMenu(false)} />
            <motion.div className="absolute inset-y-0 left-0 w-[290px] bg-paper-2 shadow-2xl" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Rail route={route} onNavigate={() => setMenu(false)} onSearch={() => { setMenu(false); setPal(true); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 overflow-x-clip lg:pl-[272px]">
        <AnimatePresence mode="wait">
          <motion.div key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            {page}
          </motion.div>
        </AnimatePresence>
      </main>
      <Palette open={pal} onClose={() => setPal(false)} />
    </div>
    </MotionConfig>
  );
}
