import { useEffect, useState } from "react";
import { type Fr, fr } from "../lib/frac";
import { det, type M, minorMatrix, rowsOf, sarrus } from "../lib/matrix";
import { Answer, Btn, Eq, Mx, Num, Op, Terms } from "./ui";

/** 2×2: hover the diagonals. */
export function Det2({ A, name = "A" }: { A: M; name?: string }) {
  const [d, setD] = useState<"main" | "anti" | null>(null);
  const [[a, b], [c, e]] = A;
  const main = a.mul(e), anti = b.mul(c);
  const tone = (i: number, j: number) =>
    d === "main" && i === j ? "row" as const : d === "anti" && i !== j ? "col" as const : undefined;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Mx data={A} bars size="lg" tone={tone} />
      <div className="space-y-2 font-mono text-[15px]">
        <div onMouseEnter={() => setD("main")} onMouseLeave={() => setD(null)} className="cursor-default rounded-lg px-3 py-1.5 hover:bg-red-tint">
          <span className="text-red-ink">↘ main</span>&nbsp; (<Num v={a} inline />)(<Num v={e} inline />) = <b><Num v={main} inline /></b>
        </div>
        <div onMouseEnter={() => setD("anti")} onMouseLeave={() => setD(null)} className="cursor-default rounded-lg px-3 py-1.5 hover:bg-sand/60">
          <span className="text-sand-ink">↙ other</span> (<Num v={b} inline />)(<Num v={c} inline />) = <b><Num v={anti} inline /></b>
        </div>
        <div className="px-3 pt-1">det {name} = <Num v={main} inline /> − (<Num v={anti} inline />) = <b className="rounded bg-red px-1.5 text-paper"><Num v={main.sub(anti)} inline /></b></div>
      </div>
    </div>
  );
}

/** 3×3 Sarrus: copy two columns, hover or auto-play the six diagonals. */
export function Sarrus({ A, name = "A", compact = false }: { A: M; name?: string; compact?: boolean }) {
  const S = sarrus(A);
  const [act, setAct] = useState<number | null>(null); // 0-2 plus, 3-5 minus
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setAct((a) => { const n = a === null ? 0 : a + 1; if (n > 5) { setPlaying(false); return null; } return n; }), 1100);
    return () => clearInterval(t);
  }, [playing]);

  const ext = A.map((r) => [...r, r[0], r[1]]);
  const cells = (k: number): [number, number][] =>
    k < 3 ? [[0, k], [1, k + 1], [2, k + 2]] : [[0, k - 1], [1, k - 2], [2, k - 3]];
  const on = act === null ? [] : cells(act);
  const tone = (i: number, j: number) => {
    if (on.some(([r, c]) => r === i && c === j)) return act! < 3 ? "row" as const : "col" as const;
    if (j >= 3) return "dim" as const;
    return undefined;
  };
  const all = [...S.plus, ...S.minus];

  return (
    <div>
      <div className="flex flex-wrap items-start gap-8">
        <div>
          <Mx data={ext} tone={tone} size={compact ? "sm" : "md"} />
          <div className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">first 2 columns copied</div>
          {!compact && <div className="mt-3 flex justify-center"><Btn onClick={() => { setAct(null); setPlaying(true); }}>▶ Play the diagonals</Btn></div>}
        </div>
        <div className="grid min-w-[260px] flex-1 grid-cols-1 gap-x-6 gap-y-1 font-mono text-[14px] sm:grid-cols-2">
          {[0, 1].map((side) => (
            <div key={side}>
              <div className={`mb-1 text-[11.5px] uppercase tracking-[0.12em] ${side === 0 ? "text-red-ink" : "text-sand-ink"}`}>
                {side === 0 ? "↘ down diagonals · add" : "↗ up diagonals · subtract"}
              </div>
              {all.slice(side * 3, side * 3 + 3).map((t, k) => {
                const idx = side * 3 + k;
                return (
                  <div key={idx} onMouseEnter={() => { setPlaying(false); setAct(idx); }} onMouseLeave={() => setAct(null)}
                    className={`cursor-default rounded-md px-2 py-1 transition-colors ${act === idx ? (side === 0 ? "bg-red-soft" : "bg-sand") : ""}`}>
                    <span className="text-ink-3">{t.label}</span> = {t.f.map((x, q) => <span key={q}>(<Num v={x} inline />)</span>)} = <b><Num v={t.p} inline /></b>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-paper-2 px-4 py-3 font-mono text-[14.5px]">
        det {name} = (<Terms vals={S.plus.map((t) => t.p)} />) − (<Terms vals={S.minus.map((t) => t.p)} />) = <Num v={S.sumP} inline /> − (<Num v={S.sumN} inline />) = <b className="rounded bg-red px-1.5 text-paper"><Num v={S.det} inline /></b>
      </div>
    </div>
  );
}

/** One-line determinant of a small matrix (used inside cofactor expansion). */
export function DetLine({ A }: { A: M }) {
  const n = rowsOf(A);
  if (n === 2) {
    const [[a, b], [c, d]] = A;
    return <span>(<Num v={a} inline />)(<Num v={d} inline />) − (<Num v={b} inline />)(<Num v={c} inline />) = <b><Num v={a.mul(d).sub(b.mul(c))} inline /></b></span>;
  }
  if (n === 3) {
    const S = sarrus(A);
    return <span>(<Terms vals={S.plus.map((t) => t.p)} />) − (<Terms vals={S.minus.map((t) => t.p)} />) = <b><Num v={S.det} inline /></b></span>;
  }
  return <b><Num v={det(A)} inline /></b>;
}

/** Cofactor expansion along row 1 (works for 3×3 and 4×4). */
export function CofactorExpansion({ A, name = "A" }: { A: M; name?: string }) {
  const n = rowsOf(A);
  const [k, setK] = useState(0);
  const terms = A[0].map((a, j) => {
    const sub = minorMatrix(A, 0, j);
    const d = det(sub);
    const signed: Fr = (j % 2 === 0 ? a : a.neg()).mul(d);
    return { a, j, sub, d, signed };
  });
  const cur = terms[k];
  const letters = "abcdefgh";
  const total = terms.reduce((s, t) => s.add(t.signed), fr(0));
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {terms.map((t) => (
          <button key={t.j} type="button" onClick={() => setK(t.j)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[13.5px] transition-colors ${k === t.j ? "border-red bg-red text-paper" : "border-line-2 text-ink-2 hover:border-red"}`}>
            {t.j % 2 === 0 ? "+" : "−"} {letters[t.j]} = <Num v={t.a} inline />
          </button>
        ))}
      </div>
      <Eq className="gap-x-4">
        <Mx data={A} size="sm" tone={(i, j) => (i === 0 && j === cur.j ? "pick" : i === 0 || j === cur.j ? "dim" : undefined)} />
        <Op>→ cover row 1 &amp; column {cur.j + 1} →</Op>
        <Mx data={cur.sub} bars size="sm" />
      </Eq>
      <div className="mt-4 space-y-1.5 rounded-lg bg-paper-2 px-4 py-3 font-mono text-[14px]">
        <div><span className="text-ink-3">|M<sub>1{cur.j + 1}</sub>| =</span> <DetLine A={cur.sub} /></div>
        <div><span className="text-ink-3">term =</span> {cur.j % 2 === 0 ? "+" : "−"} (<Num v={cur.a} inline />) × (<Num v={cur.d} inline />) = <b><Num v={cur.signed} inline /></b>
          {cur.a.isZero && <span className="ml-2 text-ok">← zero entry, so the term vanishes. Free points!</span>}</div>
      </div>
      <Answer>
        <div className="font-mono text-[15px]">
          det {name} = {terms.map((t, q) => <span key={q}>{q > 0 && " + "}(<Num v={t.signed} inline />)</span>)} = <b className="rounded bg-red px-1.5 text-paper"><Num v={total} inline /></b>
          <span className="ml-3 text-[12.5px] text-ink-3">({n}×{n}, expanded along row 1)</span>
        </div>
      </Answer>
    </div>
  );
}
