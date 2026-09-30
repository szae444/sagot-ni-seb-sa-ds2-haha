import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { type Fr, fr, txt } from "../lib/frac";
import {
  adjugate, applyOp, augment, cofactorsOf, det, identity, type M, minorMatrix, minorsOf, opLabel, rowsOf, type RowOp, scale,
} from "../lib/matrix";
import { DetLine, Sarrus } from "./DetWidgets";
import { Answer, Btn, Eq, Lbl, Mx, Num, Op } from "./ui";

// ---------------------------------------------------------------- generic stepper shell
export function Stepper({ steps, render }: { steps: { title: ReactNode }[]; render: (k: number) => ReactNode }) {
  const [k, setK] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const last = steps.length - 1;
  useEffect(() => { if (k > last) setK(last); }, [last, k]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { setK((x) => Math.min(last, x + 1)); e.preventDefault(); }
    if (e.key === "ArrowLeft") { setK((x) => Math.max(0, x - 1)); e.preventDefault(); }
  };
  return (
    <div ref={ref} tabIndex={0} onKeyDown={onKey} className="outline-none">
      <div className="mb-5 flex flex-wrap items-center gap-1.5" role="tablist">
        {steps.map((s, i) => (
          <button key={i} type="button" onClick={() => setK(i)} role="tab" aria-selected={i === k}
            className={`group flex items-center gap-2 rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
              i === k ? "border-red bg-red text-paper" : i < k ? "border-red/40 bg-red-tint text-red-ink" : "border-line-2 text-ink-3 hover:text-ink"}`}>
            <span className="font-mono">{i + 1}</span><span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={Math.min(k, last)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          {render(Math.min(k, last))}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
        <Btn onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>← Back</Btn>
        <span className="hidden font-mono text-[12px] text-ink-3 sm:inline">step {Math.min(k, last) + 1} / {steps.length} · arrow keys work too</span>
        <Btn kind="solid" onClick={() => setK((x) => Math.min(last, x + 1))} disabled={k >= last}>Next step →</Btn>
      </div>
    </div>
  );
}

const rowTxt = (r: Fr[], n: number) => `[${r.slice(0, n).map(txt).join(", ")} | ${r.slice(n).map(txt).join(", ")}]`;

// ---------------------------------------------------------------- Gauss-Jordan
const WHY: Record<RowOp["kind"], string> = {
  swap: "Swap two rows to put a good number in the pivot spot.",
  scale: "Multiply a row so its pivot becomes 1.",
  addmul: "Add a multiple of another row to turn an entry into 0.",
};

export function GaussJordan({ A, ops, notes }: { A: M; ops: RowOp[]; notes?: string[] }) {
  const n = rowsOf(A);
  const states = useMemo(() => {
    const s: M[] = [augment(A, identity(n))];
    ops.forEach((op) => s.push(applyOp(s[s.length - 1], op)));
    return s;
  }, [A, ops, n]);
  const steps = [{ title: "[A | I]" }, ...ops.map((op) => ({ title: opLabel(op, txt) })), { title: "Read A⁻¹" }];

  return (
    <Stepper steps={steps} render={(k) => {
      if (k === 0) return (
        <div>
          <p className="mb-4 text-[15px] text-ink-2">Write A on the left and the identity I on the right. The goal is to make the <b className="text-ink">left side become I</b>. Whatever the right side turns into is A<sup>−1</sup>.</p>
          <div className="flex justify-center"><Mx data={states[0]} split={n} tone={(_, j) => (j >= n ? "soft" : undefined)} /></div>
        </div>
      );
      if (k === steps.length - 1) {
        const fin = states[states.length - 1];
        const inv = fin.map((r) => r.slice(n));
        return (
          <div>
            <p className="mb-4 text-[15px] text-ink-2">The left side is now I, so the right side is the inverse.</p>
            <div className="flex justify-center"><Mx data={fin} split={n} tone={(_, j) => (j >= n ? "ok" : undefined)} /></div>
            <Answer><Eq><Lbl>A⁻¹</Lbl><Op>=</Op><Mx data={inv} /><Op>=</Op><Mx data={inv.map((r) => r.map((x) => x.isInt ? x : +(x.valueOf().toFixed(4))))} /></Eq></Answer>
          </div>
        );
      }
      const op = ops[k - 1];
      const before = states[k - 1], after = states[k];
      const changed = op.kind === "swap" ? [op.a, op.b] : [op.a];
      let calc: ReactNode;
      if (op.kind === "swap") calc = <>Row {op.a + 1} and row {op.b + 1} trade places.</>;
      else if (op.kind === "scale") calc = <>New R{op.a + 1} = {txt(op.c)} × {rowTxt(before[op.a], n)} = <b>{rowTxt(after[op.a], n)}</b></>;
      else {
        const mag = op.c.sign < 0 ? op.c.neg() : op.c;
        calc = <>New R{op.a + 1} = {rowTxt(before[op.a], n)} {op.c.sign < 0 ? "−" : "+"} {mag.eq(1) ? "" : `${txt(mag)} × `}{rowTxt(before[op.b], n)} = <b>{rowTxt(after[op.a], n)}</b></>;
      }
      return (
        <div>
          <div className="mb-1 font-mono text-[18px] text-red-ink">{opLabel(op, txt)}</div>
          <p className="mb-3 text-[14.5px] text-ink-2">{notes?.[k - 1] ?? WHY[op.kind]}</p>
          <div className="mb-5 overflow-x-auto rounded-lg bg-paper-2 px-4 py-2.5 font-mono text-[13.5px]">{calc}</div>
          <Eq className="justify-center gap-x-4">
            <Mx data={before} split={n} size="sm" className="opacity-60" />
            <Op>→</Op>
            <Mx data={after} split={n} tone={(i) => (changed.includes(i) ? "row" : undefined)} />
          </Eq>
        </div>
      );
    }} />
  );
}

// ---------------------------------------------------------------- Minors explorer (3×3)
export function MinorsExplorer({ A }: { A: M }) {
  const [p, setP] = useState<[number, number]>([0, 0]);
  const Mm = minorsOf(A);
  const [i, j] = p;
  const sub = minorMatrix(A, i, j);
  return (
    <div>
      <p className="mb-4 text-[15px] text-ink-2">Click any position. Cover its row and column, then take the 2×2 determinant (ad − bc) of the four numbers that are left.</p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Mx data={A} onClick={(r, c) => setP([r, c])} onEnter={(r, c) => setP([r, c])}
          tone={(r, c) => (r === i && c === j ? "pick" : r === i || c === j ? "dim" : "row")} />
        <Op>→</Op>
        <Mx data={sub} bars />
        <div className="font-mono text-[14.5px]">M<sub>{i + 1}{j + 1}</sub> = <DetLine A={sub} /></div>
        <Op>→</Op>
        <div>
          <div className="mb-1 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">matrix of minors</div>
          <Mx data={Mm} onClick={(r, c) => setP([r, c])} onEnter={(r, c) => setP([r, c])} tone={(r, c) => (r === i && c === j ? "hit" : undefined)} />
        </div>
      </div>
    </div>
  );
}

const SIGNS = (n: number) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ((i + j) % 2 ? "−" : "+")));

/** Minors → Cofactors → Adjugate → × 1/det, as a stepper. */
export function AdjugateMethod({ A, detNote }: { A: M; detNote?: ReactNode }) {
  const n = rowsOf(A);
  const Mm = minorsOf(A), Cf = cofactorsOf(A), Adj = adjugate(A), D = det(A);
  const flipped = (i: number, j: number) => (i + j) % 2 === 1;
  const steps = [{ title: "Minors" }, { title: "Cofactors" }, { title: "Adjugate" }, { title: "Determinant" }, { title: "× 1/det" }];
  if (D.isZero) return <p className="text-bad">det = 0, so this matrix has no inverse.</p>;
  return (
    <Stepper steps={steps} render={(k) => {
      if (k === 0) return n === 3 ? <MinorsExplorer A={A} /> : (
        <div className="flex justify-center"><Eq><span>Minors =</span><Mx data={Mm} /></Eq></div>);
      if (k === 1) return (
        <div>
          <p className="mb-4 text-[15px] text-ink-2">Apply the checkerboard of signs. Where the pattern says <b className="text-ink">−</b>, flip the sign of the minor. Where it says <b className="text-ink">+</b>, keep it.</p>
          <Eq className="justify-center gap-x-4">
            <Mx data={Mm} tone={(i, j) => (flipped(i, j) ? "col" : undefined)} />
            <Op>with</Op>
            <Mx data={SIGNS(n)} tone={(i, j) => (flipped(i, j) ? "col" : undefined)} />
            <Op>→</Op>
            <Mx data={Cf} tone={(i, j) => (flipped(i, j) ? "col" : undefined)} />
          </Eq>
          <p className="mt-4 text-center font-mono text-[13px] text-ink-3">
            flipped: {Mm.flatMap((r, i) => r.map((x, j) => (flipped(i, j) ? `−(${txt(x)}) = ${txt(x.neg())}` : null))).filter(Boolean).join(",  ")}
          </p>
        </div>
      );
      if (k === 2) return (
        <div>
          <p className="mb-4 text-[15px] text-ink-2">The adjugate is the <b className="text-ink">transpose</b> of the cofactor matrix. Rows become columns (follow the colors).</p>
          <Eq className="justify-center gap-x-4">
            <Mx data={Cf} tone={(i) => (["c1", "c2", "c3", "soft"] as const)[i]} />
            <Op>→ Adj =</Op>
            <Mx data={Adj} tone={(_, j) => (["c1", "c2", "c3", "soft"] as const)[j]} />
          </Eq>
        </div>
      );
      if (k === 3) return (
        <div>
          {n === 3 ? <Sarrus A={A} compact /> : <p className="font-mono">det = <DetLine A={A} /></p>}
          <p className="mt-3 font-mono text-[13px] text-ink-3">quick check: row 1 · cofactors = {A[0].map((a, j) => `(${txt(a)})(${txt(Cf[0][j])})`).join(" + ")} = {txt(D)} ✓</p>
          {detNote}
        </div>
      );
      const inv = scale(fr(1).div(D), Adj);
      return (
        <div>
          <p className="mb-4 text-[15px] text-ink-2">Divide every entry of the adjugate by det = <b className="text-ink">{txt(D)}</b>, and simplify each fraction.</p>
          <Answer>
            <Eq><Lbl>A⁻¹</Lbl><Op>=</Op><span className="font-mono"><Num v={fr(1).div(D)} /></span><Mx data={Adj} /><Op>=</Op><Mx data={inv} /></Eq>
          </Answer>
        </div>
      );
    }} />
  );
}

/** 2×2 inverse, animated recipe. */
export function Inverse2({ A }: { A: M }) {
  const [[a, b], [c, d]] = A;
  const D = det(A);
  const steps = [{ title: "det" }, { title: "Swap a, d" }, { title: "Negate b, c" }, { title: "÷ det" }];
  return (
    <Stepper steps={steps} render={(k) => {
      if (k === 0) return <div className="font-mono text-[15px]">det = ad − bc = (<Num v={a} inline />)(<Num v={d} inline />) − (<Num v={b} inline />)(<Num v={c} inline />) = <b className="rounded bg-red px-1.5 text-paper"><Num v={D} inline /></b>
        {D.isZero ? <span className="ml-2 text-bad">det = 0, so there is no inverse!</span> : <span className="ml-2 text-ok">not zero, so an inverse exists ✓</span>}</div>;
      if (k === 1) return <Eq className="justify-center"><Mx data={A} tone={(i, j) => (i === j ? "row" : undefined)} /><Op>→</Op><Mx data={[[d, b], [c, a]]} tone={(i, j) => (i === j ? "row" : undefined)} /></Eq>;
      if (k === 2) return <Eq className="justify-center"><Mx data={[[d, b], [c, a]]} tone={(i, j) => (i !== j ? "col" : undefined)} /><Op>→</Op><Mx data={[[d, b.neg()], [c.neg(), a]]} tone={(i, j) => (i !== j ? "col" : undefined)} /></Eq>;
      if (D.isZero) return <p className="text-bad">Can't divide by 0. No inverse.</p>;
      const inv = scale(fr(1).div(D), [[d, b.neg()], [c.neg(), a]]);
      return <Answer><Eq><Lbl>A⁻¹</Lbl><Op>=</Op><span className="font-mono"><Num v={fr(1).div(D)} /></span><Mx data={[[d, b.neg()], [c.neg(), a]]} /><Op>=</Op><Mx data={inv} /></Eq></Answer>;
    }} />
  );
}

