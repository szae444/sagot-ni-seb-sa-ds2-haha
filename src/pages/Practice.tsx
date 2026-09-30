import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Det2, Sarrus } from "../components/DetWidgets";
import { Inverse2 } from "../components/InverseWidgets";
import { MulExplorer } from "../components/MulExplorer";
import { Answer, Btn, Eq, Lbl, Mx, Num, Op } from "../components/ui";
import { type Fr, fr, parseFr } from "../lib/frac";
import { add, det, dotPairs, inverse, type M, mul, scale, sub, toM, transpose } from "../lib/matrix";
import { useStored } from "../lib/store";

const ri = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const rm = (r: number, c: number, lo = -4, hi = 6) => toM(Array.from({ length: r }, () => Array.from({ length: c }, () => ri(lo, hi))));

type Kind = "size" | "entry" | "scalar" | "add" | "transpose" | "mul" | "det2" | "det3" | "inv2";
const KINDS: { id: Kind; label: string }[] = [
  { id: "size", label: "Defined or not?" }, { id: "entry", label: "One product entry" }, { id: "scalar", label: "Scalar" },
  { id: "add", label: "Add / subtract" }, { id: "transpose", label: "Transpose" }, { id: "mul", label: "Full product" },
  { id: "det2", label: "det 2×2" }, { id: "det3", label: "det 3×3" }, { id: "inv2", label: "Inverse 2×2" },
];

type Problem = {
  kind: Kind;
  prompt: ReactNode;
  // either a grid answer, a single number, or a multiple choice
  grid?: M; num?: Fr; choices?: string[]; correct?: number;
  solution: ReactNode;
};

function make(kind: Kind): Problem {
  switch (kind) {
    case "size": {
      const d = [ri(1, 4), ri(1, 4), ri(1, 4), ri(1, 4)];
      if (Math.random() < 0.55) d[2] = d[1];
      const ok = d[1] === d[2];
      const right = ok ? `${d[0]}×${d[3]}` : "not defined";
      const pool = new Set([right, "not defined", `${d[1]}×${d[2]}`, `${d[3]}×${d[0]}`, `${d[0]}×${d[1]}`]);
      const choices = [...pool].slice(0, 4).sort(() => Math.random() - 0.5);
      return {
        kind, choices, correct: choices.indexOf(right),
        prompt: <>A is <b>{d[0]}×{d[1]}</b> and B is <b>{d[2]}×{d[3]}</b>. What is the size of A·B?</>,
        solution: <p className="font-mono">({d[0]}×<b>{d[1]}</b>)(<b>{d[2]}</b>×{d[3]}): inner {d[1]} {ok ? "=" : "≠"} {d[2]} → <b>{right}</b></p>,
      };
    }
    case "entry": {
      const n = ri(2, 3);
      const A = rm(2, n), B = rm(n, 2);
      const i = ri(0, 1), j = ri(0, 1);
      const v = dotPairs(A, B, i, j).reduce((s, [a, b]) => s.add(a.mul(b)), fr(0));
      return {
        kind, num: v,
        prompt: <><div className="mb-4">Find entry <b>({i + 1},{j + 1})</b> of A·B, that is row {i + 1} of A · column {j + 1} of B.</div>
          <Eq><Lbl>A</Lbl><Op>=</Op><Mx data={A} tone={(r) => (r === i ? "row" : undefined)} /><Lbl>B</Lbl><Op>=</Op><Mx data={B} tone={(_, c) => (c === j ? "col" : undefined)} /></Eq></>,
        solution: <MulExplorer A={A} B={B} showTable={false} />,
      };
    }
    case "scalar": {
      const c = [-3, -2, 2, 3, 4, 5][ri(0, 5)];
      const A = rm(2, 2, -5, 7);
      return { kind, grid: scale(c, A), prompt: <Eq><span className="font-sans">Compute</span><Lbl><Num v={c} />A</Lbl><span className="font-sans">where A =</span><Mx data={A} /></Eq>,
        solution: <Eq><Mx data={A.map((r) => r.map((x) => <span className="text-ink-2">({c})(<Num v={x} inline />)</span>))} size="sm" /><Op>=</Op><Mx data={scale(c, A)} /></Eq> };
    }
    case "add": {
      const A = rm(2, 3), B = rm(2, 3);
      const plus = Math.random() < 0.5;
      const R = plus ? add(A, B) : sub(A, B);
      return { kind, grid: R, prompt: <Eq><Mx data={A} /><Op>{plus ? "+" : "−"}</Op><Mx data={B} /><Op>= ?</Op></Eq>,
        solution: <Eq><Mx data={A.map((r, i) => r.map((x, j) => <span className="text-ink-2"><Num v={x} inline /> {plus ? "+" : "−"} (<Num v={B[i][j]} inline />)</span>))} size="sm" /><Op>=</Op><Mx data={R} /></Eq> };
    }
    case "transpose": {
      const A = rm(ri(2, 3), ri(2, 3), -3, 9);
      return { kind, grid: transpose(A), prompt: <Eq><span className="font-sans">Transpose</span><Lbl>A</Lbl><Op>=</Op><Mx data={A} tone={(i) => (["c1", "c2", "c3"] as const)[i]} /></Eq>,
        solution: <Eq><Lbl>Aᵀ</Lbl><Op>=</Op><Mx data={transpose(A)} tone={(_, j) => (["c1", "c2", "c3"] as const)[j]} /><span className="font-sans text-[13px] text-ink-3">row k of A became column k</span></Eq> };
    }
    case "mul": {
      const A = rm(2, 2, -3, 5), B = rm(2, 2, -3, 5);
      return { kind, grid: mul(A, B), prompt: <Eq><Mx data={A} /><Op>·</Op><Mx data={B} /><Op>= ?</Op></Eq>, solution: <MulExplorer A={A} B={B} showTable={false} /> };
    }
    case "det2": {
      const A = rm(2, 2, -6, 9);
      return { kind, num: det(A), prompt: <Eq><span className="font-sans">Find</span><span>det</span><Mx data={A} bars /></Eq>, solution: <Det2 A={A} /> };
    }
    case "det3": {
      const A = rm(3, 3, -3, 4);
      return { kind, num: det(A), prompt: <Eq><span className="font-sans">Find</span><span>det</span><Mx data={A} bars /></Eq>, solution: <Sarrus A={A} compact /> };
    }
    case "inv2": {
      let A: M;
      do { A = rm(2, 2, -4, 7); } while (![1, -1, 2, -2].includes(det(A).valueOf()));
      return { kind, grid: inverse(A)!, prompt: <><Eq><span className="font-sans">Find the inverse of</span><Mx data={A} /></Eq><p className="mt-3 text-[13.5px] text-ink-3">Fractions like 3/2 or −1/2 are fine.</p></>,
        solution: <Inverse2 A={A} /> };
    }
  }
}

type Stats = { correct: number; total: number; best: number; streak: number };

export function Practice() {
  const [on, setOn] = useStored<Kind[]>("seb-practice-kinds", KINDS.map((k) => k.id));
  const [stats, setStats] = useStored<Stats>("seb-practice", { correct: 0, total: 0, best: 0, streak: 0 });
  const pickKind = useCallback(() => (on.length ? on : KINDS.map((k) => k.id))[ri(0, Math.max(0, (on.length || KINDS.length) - 1))], [on]);
  const [p, setP] = useState<Problem>(() => make(pickKind()));
  const [grid, setGrid] = useState<string[][]>([]);
  const [single, setSingle] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [id, setId] = useState(0);

  useEffect(() => {
    setGrid(p.grid ? p.grid.map((r) => r.map(() => "")) : []);
    setSingle(""); setChoice(null); setChecked(null);
  }, [p]);

  const next = () => { setP(make(pickKind())); setId((x) => x + 1); };

  const cellOk = (i: number, j: number) => { const v = parseFr(grid[i]?.[j] ?? ""); return !!v && v.eq(p.grid![i][j]); };
  const check = () => {
    let ok = false;
    if (p.grid) ok = p.grid.every((r, i) => r.every((_, j) => cellOk(i, j)));
    else if (p.num) { const v = parseFr(single); ok = !!v && v.eq(p.num); }
    else ok = choice === p.correct;
    setChecked(ok);
    setStats((s) => { const streak = ok ? s.streak + 1 : 0; return { correct: s.correct + (ok ? 1 : 0), total: s.total + 1, streak, best: Math.max(s.best, streak) }; });
  };

  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Enter" && checked !== null) { e.preventDefault(); next(); } };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  const toggleKind = (k: Kind) => setOn((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]));
  const acc = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-10 pb-24 sm:px-10 lg:pt-16">
      <header className="flex flex-wrap items-end justify-between gap-8 border-b border-line pb-10">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-red-ink">Tool</div>
          <h1 className="mt-3 font-display text-[64px] leading-none">Practice</h1>
          <p className="mt-4 max-w-[46ch] text-[17px] text-ink-2">Fresh random problems every time, checked instantly. Get one wrong and the full solution opens.</p>
        </div>
        <dl className="flex gap-8">
          {[["streak", `${stats.streak}${stats.streak >= 3 ? " 🔥" : ""}`], ["best", stats.best], ["accuracy", `${acc}%`], ["solved", `${stats.correct}/${stats.total}`]].map(([l, v]) => (
            <div key={l as string}><dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">{l}</dt><dd className="font-display text-[34px] leading-none">{v}</dd></div>
          ))}
        </dl>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11.5px] uppercase tracking-[0.12em] text-ink-3">topics</span>
        {KINDS.map((k) => (
          <button key={k.id} type="button" onClick={() => toggleKind(k.id)}
            className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${on.includes(k.id) ? "border-red bg-red-tint text-red-ink" : "border-line-2 text-ink-3 line-through decoration-ink-3/50"}`}>
            {k.label}
          </button>
        ))}
        <button type="button" onClick={() => setStats({ correct: 0, total: 0, best: 0, streak: 0 })} className="ml-auto text-[12.5px] text-ink-3 hover:text-red-ink">reset score</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 overflow-x-auto rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow)] sm:p-8">
          <div className="mb-5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-red-ink">{KINDS.find((k) => k.id === p.kind)?.label}</div>
          <div className="text-[17px] text-ink">{p.prompt}</div>

          <div className="mt-7">
            {p.grid && grid.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-mono text-ink-3">your answer =</span>
                <span className="mx text-ink">
                  <table className="border-separate border-spacing-1"><tbody>
                    {grid.map((r, i) => <tr key={i}>{r.map((v, j) => (
                      <td key={j}><input value={v} disabled={checked !== null} aria-label={`row ${i + 1} column ${j + 1}`}
                        onChange={(e) => setGrid((g) => g.map((row, a) => row.map((x, b) => (a === i && b === j ? e.target.value : x))))}
                        onKeyDown={(e) => { if (e.key === "Enter" && checked === null) check(); }}
                        className={`h-10 w-16 rounded-md border bg-paper text-center font-mono text-[15px] outline-none focus:border-red ${checked === null ? "border-line" : cellOk(i, j) ? "border-ok bg-ok-soft text-ok" : "border-bad bg-bad-soft text-bad"}`} /></td>
                    ))}</tr>)}
                  </tbody></table>
                </span>
              </div>
            )}
            {p.num && (
              <label className="flex items-center gap-3 font-mono text-[16px]">answer =
                <input value={single} autoFocus disabled={checked !== null} onChange={(e) => setSingle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && checked === null) check(); }}
                  className={`h-11 w-28 rounded-md border bg-paper text-center outline-none focus:border-red ${checked === null ? "border-line" : checked ? "border-ok bg-ok-soft text-ok" : "border-bad bg-bad-soft text-bad"}`} />
              </label>
            )}
            {p.choices && (
              <div className="flex flex-wrap gap-2">
                {p.choices.map((c, i) => (
                  <button key={c} type="button" disabled={checked !== null} onClick={() => setChoice(i)}
                    className={`rounded-full border px-4 py-2 font-mono text-[15px] transition-colors ${
                      checked !== null && i === p.correct ? "border-ok bg-ok-soft text-ok" : checked === false && i === choice ? "border-bad bg-bad-soft text-bad" : choice === i ? "border-red bg-red-tint text-red-ink" : "border-line-2 hover:border-red"}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {checked === null ? (
              <><Btn kind="solid" onClick={check}>Check answer</Btn><Btn kind="quiet" onClick={() => { setChecked(false); setStats((s) => ({ ...s, total: s.total + 1, streak: 0 })); }}>I give up, show me</Btn></>
            ) : (
              <>
                <span className={`font-display text-[30px] ${checked ? "text-ok" : "text-bad"}`}>{checked ? ["Tama!", "Nice!", "Correct!", "Galing!"][ri(0, 3)] : "Not quite. Here's how:"}</span>
                <Btn kind="solid" onClick={next}>Next problem → <span className="font-mono text-[11px] opacity-70">Enter</span></Btn>
              </>
            )}
          </div>

          {checked !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-line pt-6">
              {checked ? <details><summary className="cursor-pointer font-mono text-[12.5px] uppercase tracking-[0.12em] text-ink-3">see the worked solution anyway</summary><div className="pt-5">{p.solution}</div></details>
                : <>{p.solution}{p.num && <Answer><span className="font-mono text-[17px]">answer = <b><Num v={p.num} /></b></span></Answer>}{p.grid && <Answer><Mx data={p.grid} /></Answer>}</>}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
