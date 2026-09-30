import { LayoutGroup, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import type { M } from "../lib/matrix";
import { Btn, Num } from "./ui";

/** A tiny multiple-choice check at the end of a section. */
export function QuickCheck({ q, options, answer, explain }: { q: ReactNode; options: ReactNode[]; answer: number; explain: ReactNode }) {
  const [pick, setPick] = useState<number | null>(null);
  const right = pick === answer;
  return (
    <div className="my-8 rounded-2xl border border-dashed border-red/50 px-6 py-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-red-ink">Quick check</div>
      <div className="mt-2 text-[16.5px] text-ink">{q}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((o, i) => {
          const state = pick === null ? "" : i === answer ? "border-ok bg-ok-soft text-ok" : i === pick ? "border-bad bg-bad-soft text-bad" : "opacity-50";
          return (
            <button key={i} type="button" onClick={() => setPick(i)} disabled={pick !== null && right}
              className={`rounded-full border border-line-2 px-4 py-1.5 font-mono text-[14px] transition-all hover:border-red ${state}`}>
              {o}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-[15px] leading-relaxed text-ink-2">
          <b className={right ? "text-ok" : "text-bad"}>{right ? "Correct!" : "Not quite."}</b> {explain}
          {!right && <button type="button" className="ml-2 text-red-ink underline" onClick={() => setPick(null)}>try again</button>}
        </motion.div>
      )}
    </div>
  );
}

/** Cells physically move from (i, j) to (j, i). Colors follow the original rows. */
export function TransposeFlip({ A }: { A: M }) {
  const [t, setT] = useState(false);
  const R = A.length, C = A[0].length;
  const rows = t ? C : R, cols = t ? R : C;
  const tones = ["bg-red-soft text-red-ink", "bg-sand text-sand-ink", "bg-ok-soft text-ok", "bg-paper-2 text-ink"];
  const cells = A.flatMap((r, i) => r.map((v, j) => ({ v, i, j })));
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <span className="font-display text-[30px] italic">{t ? <>A<sup>T</sup></> : "A"}</span>
        <span className="font-mono text-ink-3">=</span>
        <span className="mx text-ink">
          <LayoutGroup>
            <div className="grid gap-1.5 p-1" style={{ gridTemplateColumns: `repeat(${cols}, 3rem)`, gridTemplateRows: `repeat(${rows}, 2.6rem)` }}>
              {cells.map(({ v, i, j }) => (
                <motion.div key={`${i}-${j}`} layout transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{ gridRow: (t ? j : i) + 1, gridColumn: (t ? i : j) + 1 }}
                  className={`flex items-center justify-center rounded-md font-mono text-[17px] ${tones[i % tones.length]}`}>
                  <Num v={v} />
                </motion.div>
              ))}
            </div>
          </LayoutGroup>
        </span>
        <span className="font-mono text-[13px] text-ink-3">({rows}×{cols})</span>
      </div>
      <Btn kind="solid" onClick={() => setT((x) => !x)}>{t ? "↺ Flip back" : "⤢ Transpose it"}</Btn>
    </div>
  );
}

/** Numbered step header used in long worked solutions. */
export function StepHead({ n, children }: { n: number | string; children: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-baseline gap-3">
      <span className="font-mono text-[12px] text-red-ink">step {n}</span>
      <span className="text-[17px] font-medium text-ink">{children}</span>
    </div>
  );
}
