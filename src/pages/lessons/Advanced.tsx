import { useMemo, useState } from "react";
import { QuickCheck, StepHead } from "../../components/Bits";
import { CofactorExpansion, Det2, Sarrus } from "../../components/DetWidgets";
import { type Grid, gridOf, MatrixEditor, parseGrid } from "../../components/Editor";
import { AdjugateMethod, GaussJordan, Inverse2 } from "../../components/InverseWidgets";
import { MulExplorer } from "../../components/MulExplorer";
import { Answer, Btn, Callout, Eq, Formula, H3, Lbl, Mx, Num, Op, P, Reveal, Segmented, Stage, Sub } from "../../components/ui";
import { S } from "../../content";
import { type Fr, fr, txt } from "../../lib/frac";
import { det, inverse, mul, type RowOp } from "../../lib/matrix";

// ================================================================ 09 Determinant
export function DeterminantLesson() {
  const [g, setG] = useState<Grid>(gridOf(S.inv3));
  const mine = parseGrid(g);
  const [which, setWhich] = useState<"4" | "3">("4");
  return (
    <>
      <Callout kind="idea">The <b>determinant</b> is <b>one number</b> computed from a <b>square</b> matrix, written det A or |A|. The slides call it the <i>scaling factor</i> of the transformation. <b>Most important use:</b> if det A = 0, the matrix has <b>no inverse</b>.</Callout>

      <H3>2×2: "ad − bc"</H3>
      <Formula>det <Mx data={[["a", "b"], ["c", "d"]]} size="xs" /> = ad − bc</Formula>
      <P>Multiply down the main diagonal ↘, then subtract the other diagonal ↙. Hover the two lines to see which numbers they use.</P>
      <Stage><Det2 A={S.inv2} /></Stage>

      <H3>3×3: the Sarrus / diagonal method (slide 25)</H3>
      <Formula>det A = aei + bfg + cdh − ceg − afh − bdi</Formula>
      <P>Copy the first two columns to the right. The three ↘ diagonals are <b className="text-red-ink">added</b>. The three ↗ diagonals are <b className="text-sand-ink">subtracted</b>. Press play to see all six in order. This is the matrix used later in the inverse chapter:</P>
      <Stage><Sarrus A={S.inv3} /></Stage>
      <Answer><span className="font-mono text-[17px]">det A = <b>10</b></span></Answer>

      <H3>Try your own 3×3</H3>
      <P>Type any numbers, including negatives or fractions like 1/2. The diagonals update live.</P>
      <Stage>
        <div className="flex flex-wrap items-start gap-10">
          <MatrixEditor value={g} onChange={setG} resizable={false} />
          <div className="min-w-[280px] flex-1">{mine ? <Sarrus A={mine} compact /> : <p className="text-bad">Fix the red boxes. Use numbers like 3, −2, 1/2.</p>}</div>
        </div>
      </Stage>

      <H3>4×4 and bigger: cofactor expansion (slide 26)</H3>
      <P>Go across the <b className="text-ink">first row</b>. For each entry, cover its row and column, find the determinant of what's left (the <b className="text-ink">minor</b>), multiply, and use the signs <b className="text-ink">+ − + −</b>.</P>
      <Formula>|A| = a·|M<Sub>11</Sub>| − b·|M<Sub>12</Sub>| + c·|M<Sub>13</Sub>| − d·|M<Sub>14</Sub>|</Formula>
      <Callout kind="slide">On slide 26, the minor for <b>b</b> is typed with <i>f</i> and <i>n</i> in its first column. Covering row 1 and column 2 actually leaves <b>[e g h; i k l; m o p]</b>.</Callout>
      <Stage>
        <div className="mb-5"><Segmented value={which} onChange={setWhich} options={[{ v: "4", label: "4×4 bonus example" }, { v: "3", label: "Problem Set 5, det(D)" }]} /></div>
        {which === "4" ? <CofactorExpansion key="4" A={S.det4} name="M" /> : <CofactorExpansion key="3" A={S.ps5.D} name="D" />}
      </Stage>
      <Callout kind="tip">Expand along the row with the <b>most zeros</b>. A zero entry wipes out its whole term, so there's less to compute.</Callout>
      <QuickCheck q={<>det <Mx data={[[3, 5], [1, 2]]} size="xs" /> = ?</>} options={["1", "11", "−1", "6"]} answer={0} explain="(3)(2) − (5)(1) = 6 − 5 = 1." />
    </>
  );
}

// ================================================================ 10 Inverse
const SLIDE_OPS: RowOp[] = [
  { kind: "swap", a: 0, b: 1 },
  { kind: "addmul", a: 1, b: 0, c: fr(-3).div(2) },
  { kind: "swap", a: 1, b: 2 },
  { kind: "scale", a: 0, c: fr(1).div(2) },
  { kind: "scale", a: 2, c: fr(1).div(5) },
  { kind: "addmul", a: 0, b: 2, c: fr(1) },
  { kind: "addmul", a: 1, b: 2, c: fr(-1) },
];
const SLIDE_NOTES = [
  "The slides start by swapping rows 1 and 2.",
  "Turn the 3 below the first pivot into 0: subtract 3/2 of row 1.",
  "Row 2 has a 0 where the pivot should be, but row 3 has a 1 there. Swap them.",
  "Make the first pivot equal to 1.",
  "Make the third pivot equal to 1.",
  "Clear the −1 above the third pivot by adding row 3.",
  "Clear the 1 above the third pivot by subtracting row 3.",
];

export function InverseLesson() {
  const A2inv = inverse(S.inv2)!;
  return (
    <>
      <Callout kind="idea">The <b>inverse</b> A<sup>−1</sup> <b>undoes</b> A. For numbers, 5 × ⅕ = 1. For matrices, <b>A·A<sup>−1</sup> = A<sup>−1</sup>·A = I</b>. Only <b>square</b> matrices with <b>det ≠ 0</b> have an inverse.</Callout>

      <H3>2×2: the shortcut formula (slides 27–28)</H3>
      <Formula>A<sup>−1</sup> = <span className="frac"><span>1</span><span>|A|</span></span> <Mx data={[["d", "−b"], ["−c", "a"]]} size="xs" /></Formula>
      <P>In words: <b className="text-ink">swap</b> a and d, <b className="text-ink">flip the signs</b> of b and c, then <b className="text-ink">divide</b> by the determinant. Step through the slide example:</P>
      <Stage><Inverse2 A={S.inv2} /></Stage>
      <P>The slide writes it in decimals: <Mx data={[[0.6, -0.7], [-0.2, 0.4]].map((r) => r.map((x) => `${x}`.replace("-", "−")))} size="sm" />, which is the same as the fractions above. <b className="text-ink">Check:</b> A·A<sup>−1</sup> should equal I. Hover to verify:</P>
      <Stage><MulExplorer A={S.inv2} B={A2inv} an="A" bn="A⁻¹" cn="A·A⁻¹" showTable={false} /></Stage>

      <H3>3×3, method 1: row operations / Gauss-Jordan (slides 29–37)</H3>
      <Callout kind="idea">Put A and I side by side as <b>[A | I]</b>. Use row operations until the left side becomes I. Then the right side <b>is</b> A<sup>−1</sup>: <b>[A | I] → [I | A<sup>−1</sup>]</b>.</Callout>
      <P>Only three moves are allowed: <b className="text-ink">swap</b> two rows, <b className="text-ink">multiply</b> a row by a non-zero number, or <b className="text-ink">add</b> a multiple of one row to another. Always apply a move to the <i>whole</i> row, both sides of the bar. These are exactly the slides' seven steps:</P>
      <Stage><GaussJordan A={S.inv3} ops={SLIDE_OPS} notes={SLIDE_NOTES} /></Stage>
      <Callout kind="slide">The slides label every in-between matrix "I | A<sup>−1</sup>". Only the <b>last</b> one really is [I | A<sup>−1</sup>]. The others are steps along the way.</Callout>

      <H3>3×3, method 2: minors, cofactors, adjugate (slides 38–43)</H3>
      <P>Four moves: <b className="text-ink">minors → cofactors → adjugate → × 1/det</b>. Same matrix, so you should get the same answer as Gauss-Jordan:</P>
      <Stage><AdjugateMethod A={S.inv3} /></Stage>

      <H3>Practice (slide 44)</H3>
      <P>Find the inverse of this matrix. It's the coefficient matrix from chapter 11, so try it yourself before revealing.</P>
      <Eq className="my-6 justify-center"><Lbl>A</Lbl><Op>=</Op><Mx data={S.sysA} size="lg" /></Eq>
      <Reveal label="Show the worked inverse">
        <Stage><AdjugateMethod A={S.sysA} /></Stage>
      </Reveal>
      <QuickCheck q={<>What is the inverse of <Mx data={[[2, 1], [5, 3]]} size="xs" />?</>}
        options={[<Mx data={[[3, -1], [-5, 2]]} size="xs" />, <Mx data={[[3, 1], [5, 2]]} size="xs" />, <Mx data={[[-3, 1], [5, -2]]} size="xs" />]} answer={0}
        explain="det = 6 − 5 = 1. Swap 2 and 3, flip the signs of 1 and 5, then divide by 1." />
    </>
  );
}

// ================================================================ 11 Systems
const VARS = ["x", "y", "z"];
function Equation({ row, b }: { row: Fr[]; b: Fr }) {
  return (
    <div className="font-mono text-[17px]">
      {row.map((c, j) => (
        <span key={j}>
          {j > 0 && <span className="text-ink-3"> {c.sign < 0 ? "−" : "+"} </span>}
          <span className={`rounded px-0.5 ${c.isZero || c.eq(1) || c.eq(-1) ? "bg-red-soft" : ""} text-red-ink`}>
            <Num v={j > 0 && c.sign < 0 ? c.neg() : c} inline />
          </span>{VARS[j]}
        </span>
      ))}
      <span className="text-ink-3"> = </span><span className="text-sand-ink"><Num v={b} inline /></span>
    </div>
  );
}

export function SystemsLesson() {
  const [ga, setGa] = useState<Grid>(gridOf(S.sysA));
  const [gb, setGb] = useState<Grid>(gridOf(S.sysB));
  const [edit, setEdit] = useState(false);
  const A = parseGrid(ga), B = parseGrid(gb);
  const isSlide = JSON.stringify(ga) === JSON.stringify(gridOf(S.sysA)) && JSON.stringify(gb) === JSON.stringify(gridOf(S.sysB));
  const inv = useMemo(() => (A ? inverse(A) : null), [A]);
  const X = useMemo(() => (inv && B ? mul(inv, B) : null), [inv, B]);

  return (
    <>
      <div className="my-8 rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-red-ink">{isSlide ? "The slide problem: solve for x, y, z" : "Your own system"}</div>
          <div className="flex gap-2">
            {!isSlide && <Btn kind="quiet" onClick={() => { setGa(gridOf(S.sysA)); setGb(gridOf(S.sysB)); }}>Reset to slide</Btn>}
            <Btn onClick={() => setEdit((e) => !e)}>{edit ? "Done editing" : "✎ Change the numbers"}</Btn>
          </div>
        </div>
        {edit ? (
          <div className="mt-5 flex flex-wrap items-center gap-6">
            <MatrixEditor value={ga} onChange={setGa} label="A" resizable={false} />
            <div className="font-mono text-ink-3">·[x y z]ᵀ =</div>
            <MatrixEditor value={gb} onChange={setGb} label="B" resizable={false} />
            <p className="max-w-[30ch] text-[13.5px] text-ink-3">Every step below re-solves itself as you type.</p>
          </div>
        ) : A && B ? (
          <div className="mt-4 space-y-1.5 pl-2">{A.map((r, i) => <Equation key={i} row={r} b={B[i][0]} />)}</div>
        ) : null}
      </div>

      <Callout kind="idea">Write the system as one matrix equation <b>AX = B</b>, then solve <b>X = A<sup>−1</sup>B</b>. It's like solving 3x = 12 by doing x = 3<sup>−1</sup>·12 = 4.</Callout>

      {!A || !B ? <p className="text-bad">Some boxes aren't numbers yet.</p> : (
        <>
          <StepHead n={1}>Pull out the coefficients (watch the hidden ones)</StepHead>
          <P>The highlighted coefficients are the sneaky ones: a missing variable means <b className="text-ink">0</b>, and a bare <b className="text-ink">−z</b> means <b className="text-ink">−1</b>z.</P>
          <Stage>
            <Eq className="justify-center gap-x-4">
              <Mx data={A} tone={() => "row"} /><Mx data={[["x"], ["y"], ["z"]]} /><Op>=</Op><Mx data={B} tone={() => "col"} />
            </Eq>
            <div className="mt-3 flex justify-center gap-10 font-mono text-[12px] uppercase tracking-[0.12em]">
              <span className="text-red-ink">A · coefficients</span><span className="text-ink-3">X · variables</span><span className="text-sand-ink">B · constants</span>
            </div>
          </Stage>
          <Callout kind="tip">Size check for X = A<sup>−1</sup>B: (3×<b>3</b>)(<b>3</b>×1) gives 3×1, the same shape as X ✓</Callout>

          <StepHead n={2}>Find A<sup>−1</sup> (minors → cofactors → adjugate → × 1/det)</StepHead>
          {inv ? <Stage><AdjugateMethod key={JSON.stringify(ga)} A={A} /></Stage> : (
            <Callout kind="warn">det A = <Num v={det(A)} inline />. The matrix has <b>no inverse</b>, so this system has no single solution (none, or infinitely many).</Callout>
          )}
          {isSlide && <Callout kind="slide">Slides 52–53 label the minors as "MoM [A]<sup>−1</sup>". The matrix of minors is taken from <b>A itself</b>. The −1 is only a reminder that the goal is the inverse.</Callout>}

          {inv && X && (
            <>
              <StepHead n={3}>Multiply X = A<sup>−1</sup>B</StepHead>
              <P>Each row of A<sup>−1</sup> times the constants column gives one variable. Hover each answer cell.</P>
              <Stage><MulExplorer A={inv} B={B} an="A⁻¹" bn="B" showTable={false} /></Stage>
              <Answer>
                <div className="flex flex-wrap items-center gap-6">
                  <Eq><Mx data={[["x"], ["y"], ["z"]]} /><Op>=</Op><Mx data={X} /></Eq>
                  <span className="font-display text-[30px]">{X.map((r, i) => <span key={i} className="mr-5">{VARS[i]} = <Num v={r[0]} /></span>)}</span>
                </div>
              </Answer>

              <StepHead n={4}>Always check by plugging back in</StepHead>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[14px]">
                  <tbody>
                    {A.map((r, i) => {
                      const lhs = r.reduce((s, c, j) => s.add(c.mul(X[j][0])), fr(0));
                      return (
                        <tr key={i} className="border-b border-line">
                          <td className="py-2.5 pr-4 text-ink-3">eq {i + 1}</td>
                          <td className="pr-4">{r.map((c, j) => `${j ? " + " : ""}(${txt(c)})(${txt(X[j][0])})`).join("")} = <b>{txt(lhs)}</b></td>
                          <td className={lhs.eq(B[i][0]) ? "text-ok" : "text-bad"}>{lhs.eq(B[i][0]) ? `= ${txt(B[i][0])} ✓` : "✗"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

// ================================================================ 12 Cheat sheet
const RULES: [string, string, string][] = [
  ["Size", "rows × columns (RC). aᵢⱼ = row i, column j", "—"],
  ["Scalar cA", "Multiply every entry by c", "any matrix"],
  ["A ± B", "Add/subtract matching positions", "same size"],
  ["Transpose Aᵀ", "Rows ↔ columns; m×n → n×m", "any matrix"],
  ["A · B", "Entry (i,j) = row i of A · column j of B", "(m×n)(n×p) → m×p"],
  ["A²", "A · A (never square each entry)", "square"],
  ["det 2×2", "ad − bc", "square"],
  ["det 3×3", "aei + bfg + cdh − ceg − afh − bdi", "square"],
  ["det 4×4+", "a|M₁₁| − b|M₁₂| + c|M₁₃| − d|M₁₄|", "square"],
  ["Inverse 2×2", "(1/det)·[d −b; −c a]", "det ≠ 0"],
  ["Inverse (Gauss-Jordan)", "[A | I] → row ops → [I | A⁻¹]", "det ≠ 0"],
  ["Inverse (adjugate)", "minors → cofactors (+−+) → transpose → × 1/det", "det ≠ 0"],
  ["System AX = B", "X = A⁻¹B", "A invertible"],
];
const MISTAKES = [
  ["Mixing up rows and columns.", "Size is ROWS × COLUMNS. A 2×3 matrix has 2 rows."],
  ["Multiplying position by position.", "Matrix multiplication is row × column (the dot product)."],
  ["Skipping the size check.", "Write (m×n)(n×p). If the middle numbers differ, it's not defined."],
  ["Assuming AB = BA.", "Order matters. Problem Set 5: A·B works, B·A doesn't."],
  ["Squaring each entry for A².", "A² = A · A."],
  ["Sign slips.", "Put negatives in parentheses: (−3)(−4) = +12 and 1 − (−9) = 10."],
  ["Forgetting the + − + pattern", "when turning minors into cofactors."],
  ["Forgetting to transpose", "(the adjugate step) before dividing by det."],
  ["Dropping the sign of det.", "If det = −21, every entry gets divided by −21, so the signs flip."],
  ["Half-row operations.", "In Gauss-Jordan, apply the move to both sides of the bar."],
];

export function CheatSheet() {
  const signs = (n: number) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ((i + j) % 2 ? "−" : "+")));
  return (
    <>
      <div className="no-print mb-6 flex justify-end"><Btn onClick={() => window.print()}>⎙ Print this page</Btn></div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead><tr className="border-b-2 border-ink font-mono text-[11.5px] uppercase tracking-[0.12em] text-ink-3"><th className="py-2 pr-4 font-normal">Topic</th><th className="pr-4 font-normal">Rule</th><th className="font-normal">Needs</th></tr></thead>
          <tbody>
            {RULES.map(([t, r, n]) => (
              <tr key={t} className="border-b border-line transition-colors hover:bg-red-tint">
                <td className="py-3 pr-4 font-medium text-red-ink">{t}</td><td className="pr-4 font-mono text-[14px]">{r}</td><td className="text-[13.5px] text-ink-3">{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H3>Cofactor sign patterns</H3>
      <Eq className="gap-x-8"><Mx data={signs(2)} /><Mx data={signs(3)} /><Mx data={signs(4)} /><span className="font-sans text-[14px] text-ink-3">Top-left is always +, then alternate.</span></Eq>

      <H3>Ten mistakes to avoid</H3>
      <ol className="mt-4 grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {MISTAKES.map(([a, b], i) => (
          <li key={i} className="flex gap-4">
            <span className="font-display text-[30px] leading-none text-red">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[15px] leading-snug text-ink-2"><b className="font-medium text-ink">{a}</b> {b}</span>
          </li>
        ))}
      </ol>

      <H3>Errors spotted in the slides</H3>
      <ul className="mt-3 space-y-2 text-[15px] text-ink-2">
        <li><b className="text-ink">Slide 7:</b> a square matrix is n×n, not m∗n.</li>
        <li><b className="text-ink">Slide 18:</b> the last term of the product formula is a<Sub>i,n</Sub>b<Sub>n,j</Sub>.</li>
        <li><b className="text-ink">Slide 26:</b> the minor for b is [e g h; i k l; m o p].</li>
        <li><b className="text-ink">Slides 32–36:</b> in-between matrices aren't [I | A<sup>−1</sup>] yet.</li>
      </ul>
    </>
  );
}

