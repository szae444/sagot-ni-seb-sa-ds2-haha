import { type ReactNode, useState } from "react";
import { Sarrus } from "../../components/DetWidgets";
import { MulExplorer } from "../../components/MulExplorer";
import { Answer, Callout, Eq, Lbl, Mx, Num, Op, P, Reveal } from "../../components/ui";
import { S } from "../../content";
import { canMultiply, colsOf, det, type M, mul, rowsOf, scale, transpose } from "../../lib/matrix";

/** One problem: guess "defined or not" first, then reveal the full solution. */
function Item({ n, title, X, Y, xn, yn, children, cn }: {
  n: number; title: ReactNode; X?: M; Y?: M; xn?: string; yn?: string; children?: ReactNode; cn?: string;
}) {
  const [guess, setGuess] = useState<boolean | null>(null);
  const truth = X && Y ? canMultiply(X, Y) : null;
  return (
    <section id={`item-${n}`} className="scroll-mt-24 border-t border-line py-10">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <span className="font-display text-[52px] leading-none text-red">{n}</span>
        <h3 className="font-display text-[34px] leading-none">{title}</h3>
        {X && Y && <span className="font-mono text-[13px] text-ink-3">({rowsOf(X)}×{colsOf(X)})({rowsOf(Y)}×{colsOf(Y)})</span>}
      </div>
      {truth !== null && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[14.5px]">
          <span className="text-ink-2">Your call first:</span>
          {[true, false].map((g) => (
            <button key={String(g)} type="button" onClick={() => setGuess(g)}
              className={`rounded-full border px-3.5 py-1 font-mono text-[13px] transition-colors ${guess === g ? (g === truth ? "border-ok bg-ok-soft text-ok" : "border-bad bg-bad-soft text-bad") : "border-line-2 hover:border-red"}`}>
              {g ? "defined" : "not defined"}
            </button>
          ))}
          {guess !== null && <span className={guess === truth ? "text-ok" : "text-bad"}>{guess === truth ? "✓ right" : "✗ check the inner numbers"}</span>}
        </div>
      )}
      <Reveal label="Show the full solution">
        {X && Y && <MulExplorer A={X} B={Y} an={xn} bn={yn} cn={cn} />}
        {children}
      </Reveal>
    </section>
  );
}

function Given({ mats }: { mats: [string, M][] }) {
  return (
    <div className="my-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 rounded-2xl border border-line bg-card px-6 py-6 shadow-[var(--shadow)]">
      {mats.map(([n, m]) => (
        <Eq key={n}><Lbl>{n}</Lbl><Op>=</Op><Mx data={m} /><span className="font-mono text-[12px] text-ink-3">{rowsOf(m)}×{colsOf(m)}</span></Eq>
      ))}
    </div>
  );
}

// ================================================================ 07 Exercise 2
export function Exercise2() {
  const { A, B, C } = S.ex2;
  const items: [string, M, string, M][] = [["A", A, "B", B], ["B", B, "A", A], ["C", C, "A", A], ["A", A, "C", C], ["B", B, "C", C], ["A", A, "A", A], ["B", B, "B", B]];
  return (
    <>
      <P>Are the following multiplications defined? If so, compute the product.</P>
      <Given mats={[["A", A], ["B", B], ["C", C]]} />
      <Callout kind="tip">Write the sizes side by side, like (2×<b>2</b>)(<b>2</b>×3). If the two middle numbers match, it's defined, and the outer numbers give the answer's size. For each item below, <b>make your call first</b>, then open the solution.</Callout>
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[14px]">
          <thead><tr className="border-b-2 border-ink text-left text-[11.5px] uppercase tracking-[0.12em] text-ink-3"><th className="py-2 font-normal">#</th><th className="font-normal">product</th><th className="font-normal">sizes</th><th className="font-normal">verdict</th></tr></thead>
          <tbody>
            {items.map(([xn, X, yn, Y], k) => (
              <tr key={k} className="border-b border-line">
                <td className="py-2 text-ink-3">{k + 1}</td><td>{xn}·{yn}</td><td>({rowsOf(X)}×{colsOf(X)})({rowsOf(Y)}×{colsOf(Y)})</td>
                <td>
                  <details className="group"><summary className="cursor-pointer list-none text-red-ink"><span className="group-open:hidden">reveal</span></summary>
                    {canMultiply(X, Y) ? <span className="text-ok">defined → {rowsOf(X)}×{colsOf(Y)}</span> : <span className="text-bad">not defined</span>}</details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.map(([xn, X, yn, Y], k) => (
        <Item key={k} n={k + 1} title={<>{xn} · {yn}</>} X={X} Y={Y} xn={xn} yn={yn} cn={`${xn}·${yn}`} />
      ))}
    </>
  );
}

// ================================================================ 08 Problem Set 5
export function ProblemSet5() {
  const { A, B, C, D } = S.ps5;
  const AB = mul(A, B), BC = mul(B, C);
  const glance: [string, ReactNode][] = [
    ["A·B", <Mx data={AB} size="xs" />], ["C·A", <Mx data={mul(C, A)} size="xs" />], ["A²", <Mx data={mul(A, A)} size="xs" />],
    ["C²", <span className="text-bad">not defined</span>], ["B·C", <Mx data={BC} size="xs" />], ["4A·(−3)B", <Mx data={scale(-12, AB)} size="xs" />],
    ["B·2C", <Mx data={scale(2, BC)} size="xs" />], ["det(D)", <b>−43</b>], ["B·A", <span className="text-bad">not defined</span>], ["Aᵀ·B", <Mx data={mul(transpose(A), B)} size="xs" />],
  ];
  return (
    <>
      <Given mats={[["A", A], ["B", B], ["C", C], ["D", D]]} />
      <details className="group my-6 rounded-2xl border border-line bg-paper-2 px-6 py-4">
        <summary className="cursor-pointer list-none font-mono text-[13px] uppercase tracking-[0.12em] text-red-ink">
          <span className="group-open:hidden">▸ Answer key at a glance (spoilers!)</span><span className="hidden group-open:inline">▾ Answer key</span>
        </summary>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {glance.map(([q, a], k) => (
            <a key={k} href={`#/learn/problem-set-5`} onClick={(e) => { e.preventDefault(); document.getElementById(`item-${k + 1}`)?.scrollIntoView({ behavior: "smooth" }); }}
              className="flex items-center gap-4 rounded-lg px-2 py-1 hover:bg-card">
              <span className="w-5 font-mono text-[12px] text-ink-3">{k + 1}</span><span className="w-24 font-mono text-[14px]">{q}</span>{a}
            </a>
          ))}
        </div>
      </details>

      <Item n={1} title="A · B" X={A} Y={B} xn="A" yn="B" cn="A·B" />
      <Item n={2} title="C · A" X={C} Y={A} xn="C" yn="A" cn="C·A" />
      <Item n={3} title="A² = A · A" X={A} Y={A} xn="A" yn="A" cn="A²" />
      <Item n={4} title="C² = C · C" X={C} Y={C} xn="C" yn="C">
        <P>C is 3×2, which is not square, so C² can't exist.</P>
      </Item>
      <Item n={5} title="B · C" X={B} Y={C} xn="B" yn="C" cn="B·C" />
      <Item n={6} title="4A · (−3)B">
        <P><b className="text-ink">Shortcut:</b> pull the scalars out front and multiply them: 4A · (−3)B = (4)(−3) · (A·B) = <b className="text-ink">−12 · (A·B)</b>. We already have A·B from #1.</P>
        <Eq className="my-4 justify-center"><Op>−12 ·</Op><Mx data={AB} /><Op>=</Op><Mx data={AB.map((r) => r.map((x) => <span className="text-ink-2">−12(<Num v={x} inline />)</span>))} /></Eq>
        <Answer><Eq><Lbl>4A·(−3)B</Lbl><Op>=</Op><Mx data={scale(-12, AB)} /></Eq></Answer>
        <P><b className="text-ink">The long way gives the same thing.</b> Compute 4A and (−3)B first, then multiply. Hover to check:</P>
        <MulExplorer A={scale(4, A)} B={scale(-3, B)} an="4A" bn="(−3)B" showTable={false} />
      </Item>
      <Item n={7} title="B · 2C">
        <P><b className="text-ink">Shortcut:</b> B · 2C = 2 · (B·C). We already have B·C from #5.</P>
        <Eq className="my-4 justify-center"><Op>2 ·</Op><Mx data={BC} /><Op>=</Op><Mx data={scale(2, BC)} /></Eq>
        <Answer><Eq><Lbl>B·2C</Lbl><Op>=</Op><Mx data={scale(2, BC)} /></Eq></Answer>
        <P>Long way check:</P>
        <MulExplorer A={B} B={scale(2, C)} an="B" bn="2C" showTable={false} />
      </Item>
      <Item n={8} title="det(D)">
        <P>D is 3×3, so use the <b className="text-ink">Sarrus (diagonal) method</b>: copy the first two columns, add the ↘ diagonals, subtract the ↗ diagonals. Hover each diagonal or press play.</P>
        <Sarrus A={D} name="D" />
        <p className="mt-4 font-mono text-[13px] text-ink-3">double-check (cofactor expansion on row 1): 1·(6 − 3) − 0·(…) + 2·(−5 − 18) = 3 − 46 = −43 ✓</p>
        <Answer><span className="font-mono text-[18px]">det(D) = <b><Num v={det(D)} /></b></span></Answer>
      </Item>
      <Item n={9} title="B · A" X={B} Y={A} xn="B" yn="A">
        <P>Notice A·B (#1) worked, but B·A doesn't. <b className="text-ink">Order matters!</b></P>
      </Item>
      <Item n={10} title="Aᵀ · B">
        <P><b className="text-ink">Step 1:</b> transpose A (rows become columns).</P>
        <Eq className="my-4 justify-center"><Lbl>A</Lbl><Op>=</Op><Mx data={A} tone={(i) => (i === 0 ? "c1" : "c2")} /><Op>→</Op><Lbl>Aᵀ</Lbl><Op>=</Op><Mx data={transpose(A)} tone={(_, j) => (j === 0 ? "c1" : "c2")} /></Eq>
        <P><b className="text-ink">Step 2:</b> multiply Aᵀ · B.</P>
        <MulExplorer A={transpose(A)} B={B} an="Aᵀ" bn="B" cn="Aᵀ·B" />
      </Item>
    </>
  );
}
