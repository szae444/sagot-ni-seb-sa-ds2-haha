import { useMemo, useState } from "react";
import { canMultiply, colsOf, dotPairs, type M, mul, rowsOf } from "../lib/matrix";
import { Answer, Eq, Lbl, Mx, Num, Op, SizeCheck, Terms } from "./ui";

/**
 * The core widget: hover or tap any answer cell to see which row and column made it,
 * and the dot-product arithmetic. "Quiz me" hides the answers until you tap them.
 */
export function MulExplorer({ A, B, an = "A", bn = "B", cn, showTable = true, startQuiz = false }: {
  A: M; B: M; an?: string; bn?: string; cn?: string; showTable?: boolean; startQuiz?: boolean;
}) {
  const ok = canMultiply(A, B);
  const C = useMemo(() => (ok ? mul(A, B) : null), [A, B, ok]);
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [quiz, setQuiz] = useState(startQuiz);
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [table, setTable] = useState(false);

  const size = <SizeCheck a={[rowsOf(A), colsOf(A)]} b={[rowsOf(B), colsOf(B)]} an={an} bn={bn} />;
  if (!C) {
    return (
      <div>
        <Eq><Mx data={A} size="sm" /><Op>·</Op><Mx data={B} size="sm" /></Eq>
        {size}
        <Answer><span className="text-[15px]"><b>{an}·{bn} is not defined.</b> {an} has {colsOf(A)} column{colsOf(A) > 1 ? "s" : ""}, but {bn} has {rowsOf(B)} row{rowsOf(B) > 1 ? "s" : ""}. For a product, those two numbers must be equal.</span></Answer>
      </div>
    );
  }

  const [i, j] = hover ?? sel;
  const key = (r: number, c: number) => `${r}-${c}`;
  const visible = (r: number, c: number) => !quiz || shown.has(key(r, c));
  const pairs = dotPairs(A, B, i, j);
  const prods = pairs.map(([a, b]) => a.mul(b));

  const pick = (r: number, c: number) => {
    setSel([r, c]);
    if (quiz) setShown((s) => new Set(s).add(key(r, c)));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {size}
        <div className="flex gap-2">
          <button type="button" onClick={() => { setQuiz((q) => !q); setShown(new Set()); }}
            className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${quiz ? "border-red bg-red text-paper" : "border-line-2 text-ink-2 hover:border-red hover:text-red-ink"}`}>
            {quiz ? "Quiz mode on" : "Quiz me"}
          </button>
          {showTable && (
            <button type="button" onClick={() => setTable((t) => !t)}
              className="rounded-full border border-line-2 px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-red hover:text-red-ink">
              {table ? "Hide all steps" : "All steps"}
            </button>
          )}
        </div>
      </div>

      <Eq className="justify-center gap-x-4">
        <Mx data={A} tone={(r) => (r === i ? "row" : undefined)} />
        <Op>×</Op>
        <Mx data={B} tone={(_, c) => (c === j ? "col" : undefined)} />
        <Op>=</Op>
        <Mx
          data={C.map((row, r) => row.map((v, c) => (visible(r, c) ? v : <span className="opacity-60">?</span>)))}
          tone={(r, c) => (r === i && c === j ? "hit" : undefined)}
          onEnter={(r, c) => setHover([r, c])}
          onLeave={() => setHover(null)}
          onClick={pick}
        />
      </Eq>

      <p className="mt-4 text-center text-[13px] text-ink-3">
        {quiz ? "Work out each entry in your head, then tap it to check." : "Hover or tap any cell of the answer."}
      </p>

      <div className="mt-4 rounded-xl bg-paper-2 px-5 py-4 font-mono text-[14.5px] leading-relaxed">
        <div className="mb-1 text-[12px] uppercase tracking-[0.12em] text-ink-3">
          entry ({i + 1},{j + 1}) = <span className="text-red-ink">row {i + 1} of {an}</span> · <span className="text-sand-ink">column {j + 1} of {bn}</span>
        </div>
        {visible(i, j) ? (
          <div className="flex flex-wrap items-center gap-x-1.5">
            {pairs.map(([a, b], k) => (
              <span key={k}>
                {k > 0 && <span className="text-ink-3"> + </span>}
                (<span className="text-red-ink"><Num v={a} inline /></span>)(<span className="text-sand-ink"><Num v={b} inline /></span>)
              </span>
            ))}
            <span className="text-ink-3"> = </span><Terms vals={prods} />
            <span className="text-ink-3"> = </span><b className="rounded bg-red px-1.5 text-paper"><Num v={C[i][j]} inline /></b>
          </div>
        ) : (
          <div className="text-ink-3">Hidden. Tap the cell when you have your answer.</div>
        )}
      </div>

      {table && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[13.5px]">
            <thead><tr className="border-b border-line text-[11.5px] uppercase tracking-[0.1em] text-ink-3"><th className="py-2 pr-3">entry</th><th className="pr-3">work</th><th className="text-right">=</th></tr></thead>
            <tbody>
              {C.flatMap((row, r) => row.map((v, c) => {
                const ps = dotPairs(A, B, r, c);
                return (
                  <tr key={key(r, c)} onMouseEnter={() => setHover([r, c])} onMouseLeave={() => setHover(null)}
                    className={`cursor-pointer border-b border-line/70 transition-colors ${r === i && c === j ? "bg-red-tint" : "hover:bg-paper-2"}`} onClick={() => pick(r, c)}>
                    <td className="py-1.5 pr-3 text-red-ink">c<sub>{r + 1}{c + 1}</sub></td>
                    <td className="pr-3 text-ink-2">{ps.map(([a, b], k) => <span key={k}>{k > 0 && " + "}(<Num v={a} inline />)(<Num v={b} inline />)</span>)} = <Terms vals={ps.map(([a, b]) => a.mul(b))} /></td>
                    <td className="text-right font-semibold text-ok"><Num v={v} inline /></td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      )}

      {cn !== undefined && quiz && shown.size < C.length * C[0].length && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-line-2 px-5 py-3 text-[14px] text-ink-3">
          <span>Final answer hidden while quiz mode is on ({shown.size}/{C.length * C[0].length} checked).</span>
          <button type="button" className="text-red-ink underline" onClick={() => setShown(new Set(C.flatMap((row, r) => row.map((_, c) => key(r, c)))))}>reveal all</button>
        </div>
      )}
      {cn !== undefined && (!quiz || shown.size >= C.length * C[0].length) && (
        <Answer>
          <Eq><Lbl>{cn}</Lbl><Op>=</Op><Mx data={C} /><span className="text-[13px] text-ink-3">({rowsOf(C)}×{colsOf(C)})</span></Eq>
        </Answer>
      )}
    </div>
  );
}
