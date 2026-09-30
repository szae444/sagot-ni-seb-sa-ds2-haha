import { motion } from "motion/react";
import { MulExplorer } from "../components/MulExplorer";
import { Btn, Mx } from "../components/ui";
import { CHAPTERS, REVIEWER_PDF, S, SLIDES_PDF } from "../content";
import { go, useProgress, useStored } from "../lib/store";

const rise = (d: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

export function Home() {
  const { isDone, done } = useProgress();
  const [stats] = useStored("seb-practice", { correct: 0, total: 0, best: 0, streak: 0 });
  const nextUp = CHAPTERS.find((c) => !isDone(c.id));

  return (
    <div className="px-5 sm:px-10">
      {/* ---------------- hero: asymmetric, the widget is real, not decoration */}
      <section className="mx-auto grid max-w-[1240px] gap-12 pt-12 pb-20 grid-cols-[minmax(0,1fr)] lg:pt-20 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-16">
        <div>
          <motion.div {...rise(0)} className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3">
            DS2 · Topic 3.2 · Matrices
          </motion.div>
          <motion.h1 {...rise(0.06)} className="mt-6 font-display text-[64px] leading-[0.92] tracking-[-0.01em] text-ink sm:text-[92px]">
            Sagot ni Seb<br />sa DS2 <em className="text-red">haha.</em>
          </motion.h1>
          <motion.p {...rise(0.14)} className="mt-8 max-w-[44ch] text-[18px] leading-relaxed text-ink-2">
            The whole matrices lesson, rebuilt so you can <b className="font-medium text-ink">poke at it</b>. Every slide example,
            Exercise 1 &amp; 2, and all ten items of Problem Set 5 are here, solved step by step with nothing skipped.
          </motion.p>
          <motion.div {...rise(0.2)} className="mt-9 flex flex-wrap gap-3">
            <Btn kind="solid" onClick={() => go(`/learn/${nextUp?.id ?? "matrix"}`)} className="!px-6 !py-3 !text-[15px]">
              {done.length && nextUp ? `Continue: ${nextUp.num} ${nextUp.title}` : "Start with chapter 01"} →
            </Btn>
            <Btn onClick={() => go("/learn/problem-set-5")} className="!px-6 !py-3 !text-[15px]">Straight to Problem Set 5</Btn>
          </motion.div>
          <motion.dl {...rise(0.26)} className="mt-12 grid max-w-[460px] grid-cols-3 border-t border-line pt-6">
            {[
              ["12", "chapters"],
              ["27", "solved problems"],
              [stats.total ? `${stats.correct}/${stats.total}` : "∞", stats.total ? "practice score" : "practice problems"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-[38px] leading-none text-ink">{n}</dt>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div {...rise(0.18)} className="relative">
          <div className="absolute -top-3 left-6 z-10 rounded-full bg-red px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">
            Try it: slide 19
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card p-6 pt-8 shadow-[var(--shadow)]">
            <MulExplorer A={S.mulL} B={S.mulR} an="L" bn="R" showTable={false} />
          </div>
          <p className="mt-3 pl-2 text-[13.5px] text-ink-3">
            Every answer cell is live: it shows the row and column that made it. This is how matrix multiplication works.
          </p>
        </motion.div>
      </section>

      {/* ---------------- index: editorial list, not a card grid */}
      <section className="mx-auto max-w-[1240px] border-t border-ink/80 pt-8 pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[44px] leading-none">The index</h2>
          <p className="max-w-[40ch] text-[14.5px] text-ink-3">Go in order the first time. Chapters 07 and 08 are the exercises, fully solved. Try them before you peek.</p>
        </div>
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-x-12 md:grid-cols-2">
          {CHAPTERS.map((c, i) => (
            <motion.li key={c.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: (i % 6) * 0.04 }}>
              <button type="button" onClick={() => go(`/learn/${c.id}`)}
                className="group grid w-full grid-cols-[64px_1fr_auto] items-baseline gap-4 border-b border-line py-5 text-left transition-colors hover:border-red">
                <span className={`font-display text-[40px] leading-none transition-colors ${c.kind === "solve" ? "text-red" : "text-ink-3 group-hover:text-red"}`}>{c.num}</span>
                <span>
                  <span className="block text-[18px] font-medium text-ink">{c.title}
                    {c.kind === "solve" && <span className="ml-2 rounded-full bg-red-soft px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.12em] text-red-ink">solved</span>}
                  </span>
                  <span className="mt-1 block text-[14px] leading-snug text-ink-3">{c.blurb}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  {isDone(c.id) ? <span className="text-[13px] text-ok">✓ done</span> : <span className="translate-x-[-4px] text-ink-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>}
                  <span className="font-mono text-[10.5px] text-ink-3">{c.slides}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ---------------- tools: one big, two small, deliberately uneven */}
      <section className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-5 pb-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <button type="button" onClick={() => go("/lab")}
          className="group relative overflow-hidden rounded-3xl bg-[#5c0f18] p-8 text-left text-[#fbeae6] transition-transform duration-500 hover:-translate-y-0.5 sm:p-10">
          <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-[#f3b7b0]">Tool · Matrix Lab</div>
          <h3 className="mt-3 max-w-[16ch] font-display text-[46px] leading-[0.98]">Type in any matrix. Get every step.</h3>
          <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-[#f0cfc9]">
            Add, multiply, transpose, powers, determinants, both inverse methods, and solving systems. Use it to check your seatwork answers.
          </p>
          <span className="mt-8 inline-flex items-center gap-2 border-b border-[#f3b7b0]/60 pb-0.5 text-[15px]">Open the lab <span className="transition-transform duration-300 group-hover:translate-x-1">→</span></span>
          <div className="pointer-events-none absolute -right-6 -bottom-8 hidden rotate-[-8deg] opacity-25 sm:block text-[#fbeae6]">
            <Mx data={[[1, 1, 1], [0, 2, 5], [2, 5, -1]]} size="lg" />
          </div>
        </button>
        <div className="grid gap-5">
          <button type="button" onClick={() => go("/practice")} className="group rounded-3xl border border-line bg-card p-7 text-left transition-colors hover:border-red">
            <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-red-ink">Tool · Practice</div>
            <h3 className="mt-2 font-display text-[32px] leading-tight">Endless random problems</h3>
            <p className="mt-2 text-[14.5px] text-ink-3">Checked instantly, with the full solution when you miss. {stats.best ? `Best streak: ${stats.best} 🔥` : "Build a streak."}</p>
          </button>
          <button type="button" onClick={() => go("/cards")} className="group rounded-3xl border border-line bg-red-tint p-7 text-left transition-colors hover:border-red">
            <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-red-ink">Tool · Flashcards</div>
            <h3 className="mt-2 font-display text-[32px] leading-tight">Rules you must memorize</h3>
            <p className="mt-2 text-[14.5px] text-ink-3">Flip, sort into "got it" and "again", and repeat until the pile is empty.</p>
          </button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-line py-8 text-[13.5px] text-ink-3">
        <span>Sources: {SLIDES_PDF ? <><a className="link-u text-ink-2" href={SLIDES_PDF} target="_blank" rel="noreferrer">3.2. Matrices.pdf</a> · </> : <>3.2 Matrices slides · </>}<a className="link-u text-ink-2" href={REVIEWER_PDF} target="_blank" rel="noreferrer">sagot sa ds2 ni seb.pdf</a></span>
        <span className="font-display text-[20px] italic text-red-ink">Kaya mo 'yan, Seb.</span>
      </footer>
    </div>
  );
}
