import { type ReactNode, useState } from "react";
import { TransposeFlip } from "../components/Bits";
import { CofactorExpansion, Det2, Sarrus } from "../components/DetWidgets";
import { type Grid, gridOf, MatrixEditor, parseGrid } from "../components/Editor";
import { AdjugateMethod, GaussJordan, Inverse2 } from "../components/InverseWidgets";
import { MulExplorer } from "../components/MulExplorer";
import { Answer, Callout, Eq, Lbl, Mx, Num, Op, Stage } from "../components/ui";
import { S } from "../content";
import { parseFr } from "../lib/frac";
import {
  add, autoGaussJordan, colsOf, det, inverse, isSquare, type M, power, rowsOf, sameSize, scale, sub,
} from "../lib/matrix";

type OpId = "add" | "sub" | "scalar" | "transpose" | "mul" | "pow" | "det" | "invAdj" | "invGJ" | "solve";
const OPS: { id: OpId; label: string; needsB?: boolean }[] = [
  { id: "mul", label: "A · B", needsB: true },
  { id: "add", label: "A + B", needsB: true },
  { id: "sub", label: "A − B", needsB: true },
  { id: "scalar", label: "c · A" },
  { id: "transpose", label: "Aᵀ" },
  { id: "pow", label: "Aⁿ" },
  { id: "det", label: "det A" },
  { id: "invAdj", label: "A⁻¹ · adjugate" },
  { id: "invGJ", label: "A⁻¹ · Gauss-Jordan" },
  { id: "solve", label: "Solve AX = B", needsB: true },
];

const PRESETS: { name: string; op: OpId; A: M; B?: M }[] = [
  { name: "Slide 19 product", op: "mul", A: S.mulL, B: S.mulR },
  { name: "Exercise 1", op: "mul", A: S.ex1L, B: S.ex1R },
  { name: "Slide 13 addition", op: "add", A: S.addP, B: S.addQ },
  { name: "Slide 21 power", op: "pow", A: S.pow },
  { name: "PS5 det(D)", op: "det", A: S.ps5.D },
  { name: "4×4 determinant", op: "det", A: S.det4 },
  { name: "Slide 30 inverse", op: "invGJ", A: S.inv3 },
  { name: "Slide 46 system", op: "solve", A: S.sysA, B: S.sysB },
];

export function Lab() {
  const [op, setOp] = useState<OpId>("mul");
  const [ga, setGa] = useState<Grid>(gridOf(S.mulL));
  const [gb, setGb] = useState<Grid>(gridOf(S.mulR));
  const [c, setC] = useState("4");
  const [n, setN] = useState(2);
  const A = parseGrid(ga), B = parseGrid(gb);
  const cur = OPS.find((o) => o.id === op)!;
  const solveMode = op === "solve";

  const load = (p: (typeof PRESETS)[number]) => {
    setOp(p.op); setGa(gridOf(p.A)); if (p.B) setGb(gridOf(p.B));
  };
  const pickOp = (id: OpId) => {
    setOp(id);
    if (id === "solve" && A) setGb(Array.from({ length: rowsOf(A) }, (_, i) => [gb[i]?.[0] ?? "0"]));
  };

  let out: ReactNode = null;
  const k = JSON.stringify([op, ga, gb, c, n]);
  if (!A || (cur.needsB && !B)) out = <p className="text-bad">Some boxes aren't valid numbers yet (red). Use numbers like 3, −2, 0.5 or 1/2.</p>;
  else if (op === "add" || op === "sub") {
    out = !sameSize(A, B!) ? <Callout kind="warn">A is {rowsOf(A)}×{colsOf(A)} and B is {rowsOf(B!)}×{colsOf(B!)}. Addition and subtraction need the <b>same size</b>, so this is not defined.</Callout> : (
      <>
        <Eq className="justify-center"><Mx data={A} size="sm" /><Op>{op === "add" ? "+" : "−"}</Op><Mx data={B!} size="sm" /><Op>=</Op>
          <Mx data={A.map((r, i) => r.map((x, j) => <span className="text-ink-2"><Num v={x} inline /> {op === "add" ? "+" : "−"} (<Num v={B![i][j]} inline />)</span>))} size="sm" /></Eq>
        <Answer><Eq><Lbl>{op === "add" ? "A + B" : "A − B"}</Lbl><Op>=</Op><Mx data={op === "add" ? add(A, B!) : sub(A, B!)} /></Eq></Answer>
      </>
    );
  } else if (op === "scalar") {
    const cv = parseFr(c);
    out = !cv ? <p className="text-bad">c isn't a valid number.</p> : (
      <>
        <Eq className="justify-center"><Lbl>{c}A</Lbl><Op>=</Op><Mx data={A.map((r) => r.map((x) => <span className="text-ink-2">({c})(<Num v={x} inline />)</span>))} size="sm" /></Eq>
        <Answer><Eq><Lbl>{c}A</Lbl><Op>=</Op><Mx data={scale(cv, A)} /></Eq></Answer>
      </>
    );
  } else if (op === "transpose") out = <TransposeFlip key={k} A={A} />;
  else if (op === "mul") out = <MulExplorer key={k} A={A} B={B!} cn="A·B" />;
  else if (!isSquare(A)) out = <Callout kind="warn">This needs a <b>square</b> matrix, but A is {rowsOf(A)}×{colsOf(A)}.</Callout>;
  else if (op === "pow") {
    out = (
      <>
        {n > 1 && <MulExplorer key={k} A={power(A, n - 1)} B={A} an={n - 1 === 1 ? "A" : `A^${n - 1}`} bn="A" showTable={false} />}
        <Answer><Eq><Lbl>A<sup>{n}</sup></Lbl><Op>=</Op><Mx data={power(A, n)} /></Eq></Answer>
      </>
    );
  } else if (rowsOf(A) === 1) out = <p className="text-ink-2">A 1×1 matrix is just a number: det = {ga[0][0]}, and the inverse is 1/{ga[0][0]}.</p>;
  else if (op === "det") {
    const s = rowsOf(A);
    out = s === 2 ? <Det2 key={k} A={A} /> : s === 3 ? <><Sarrus key={k} A={A} /><div className="mt-8" /><CofactorExpansion key={k + "c"} A={A} /></> : <CofactorExpansion key={k} A={A} />;
  } else if (det(A).isZero) out = <Callout kind="warn">det A = 0, so A has <b>no inverse</b>{op === "solve" ? " and the system has no single solution" : ""}.</Callout>;
  else if (op === "invAdj") out = <>{rowsOf(A) === 2 && <div className="mb-10"><Inverse2 key={k + "2"} A={A} /></div>}<AdjugateMethod key={k} A={A} /></>;
  else if (op === "invGJ") out = <GaussJordan key={k} A={A} ops={autoGaussJordan(A).ops} />;
  else if (op === "solve") {
    const inv = inverse(A)!;
    out = rowsOf(B!) !== rowsOf(A) || colsOf(B!) !== 1 ? <p className="text-bad">B must be a column with {rowsOf(A)} rows.</p> : (
      <>
        <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3">1 · the inverse</div>
        <AdjugateMethod key={k} A={A} />
        <div className="mt-10 mb-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3">2 · X = A⁻¹B</div>
        <MulExplorer key={k + "m"} A={inv} B={B!} an="A⁻¹" bn="B" cn="X" showTable={false} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-10 pb-24 sm:px-10 lg:pt-16">
      <header className="grid gap-6 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-red-ink">Tool</div>
          <h1 className="mt-3 font-display text-[64px] leading-none">Matrix Lab</h1>
          <p className="mt-4 max-w-[54ch] text-[17px] leading-relaxed text-ink-2">Type in any matrices (fractions like <span className="font-mono">3/4</span> work), pick an operation, and get the full step-by-step solution. Use it to check seatwork answers.</p>
        </div>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-3">Load an example from the slides
          <select className="rounded-lg border border-line-2 bg-card px-3 py-2 text-[14px] text-ink" value="" onChange={(e) => { const p = PRESETS[+e.target.value]; if (p) load(p); }}>
            <option value="">Choose…</option>
            {PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
          </select>
        </label>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {OPS.map((o) => (
          <button key={o.id} type="button" onClick={() => pickOp(o.id)}
            className={`rounded-full border px-4 py-2 font-mono text-[13.5px] transition-colors ${op === o.id ? "border-red bg-red text-paper" : "border-line-2 text-ink-2 hover:border-red hover:text-red-ink"}`}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-8 rounded-2xl border border-line bg-paper-2 px-6 py-6">
        <MatrixEditor value={ga} onChange={(g) => { setGa(g); if (solveMode) setGb(Array.from({ length: g.length }, (_, i) => [gb[i]?.[0] ?? "0"])); }} label="A" square={solveMode} />
        {cur.needsB && <MatrixEditor value={gb} onChange={setGb} label="B" resizable={!solveMode} />}
        {op === "scalar" && <label className="flex items-center gap-2 font-mono text-[15px]">c = <input value={c} onChange={(e) => setC(e.target.value)} className="h-9 w-16 rounded-md border border-line bg-paper text-center" /></label>}
        {op === "pow" && <label className="flex items-center gap-3 font-mono text-[15px]">n = <input type="range" min={1} max={6} value={n} onChange={(e) => setN(+e.target.value)} className="accent-[var(--red)]" /><b className="text-red-ink">{n}</b></label>}
      </div>

      <Stage className="mt-8">{out}</Stage>
    </div>
  );
}
