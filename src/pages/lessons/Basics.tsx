import { useState } from "react";
import { QuickCheck, TransposeFlip } from "../../components/Bits";
import { MulExplorer } from "../../components/MulExplorer";
import { Answer, Callout, Eq, Formula, H3, Lbl, Mx, Num, Op, P, Segmented, Stage, Sub } from "../../components/ui";
import { S } from "../../content";
import { add, power, scale, sub } from "../../lib/matrix";

// ================================================================ 01 What is a matrix
export function MatrixLesson() {
  const [h, setH] = useState<[number, number]>([1, 2]);
  const [r, setR] = useState(2);
  const [c, setC] = useState(3);
  const [ident, setIdent] = useState(false);
  const square = r === c;
  const kind = r === 1 && c === 1 ? "a 1×1 matrix (just one number)" : r === 1 ? "a row matrix" : c === 1 ? "a column matrix" : square ? (ident ? "an identity matrix" : "a square matrix") : "a rectangular matrix";
  const builder = Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) =>
    square && ident ? (i === j ? 1 : 0) : <span className="text-ink-2">a<Sub>{i + 1}{j + 1}</Sub></span>));

  return (
    <>
      <Callout kind="idea">A <b>matrix</b> is a <b>rectangle of numbers</b> arranged in <b>rows</b> (going across ↔) and <b>columns</b> (going down ↕). Think of a seating chart or a spreadsheet.</Callout>
      <P>We describe a matrix by its <b className="text-ink">size</b>: the number of rows, then the number of columns, read as <i>"m by n"</i>. The slides' example is a <i>"two by three matrix of integers"</i>. Hover any number to read its position.</P>

      <Stage>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <Mx data={S.intro} size="lg" onEnter={(i, j) => setH([i, j])}
            tone={(i, j) => (i === h[0] && j === h[1] ? "hit" : i === h[0] ? "row" : j === h[1] ? "col" : undefined)} />
          <div className="min-w-[220px]">
            <div className="font-display text-[56px] leading-none">a<sub className="text-[0.5em]">{h[0] + 1}{h[1] + 1}</sub> = <Num v={S.intro[h[0]][h[1]]} /></div>
            <div className="mt-3 font-mono text-[14px]"><span className="rounded bg-red-soft px-1.5 text-red-ink">row {h[0] + 1}</span> · <span className="rounded bg-sand px-1.5 text-sand-ink">column {h[1] + 1}</span></div>
            <div className="mt-3 text-[14px] text-ink-3">2 rows, 3 columns → size <b className="text-ink">2×3</b></div>
          </div>
        </div>
      </Stage>

      <Callout kind="tip">Memory trick: <b>RC</b>, like <i>Roman Catholic</i>. <b>R</b>ows first, then <b>C</b>olumns. This order is used for the size <i>and</i> for positions: a<Sub>ij</Sub> means row i, column j.</Callout>

      <H3>Build a matrix</H3>
      <P>Change the number of rows and columns and see what the matrix is called. Every entry is named a<Sub>ij</Sub>.</P>
      <Stage>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <Mx data={builder} />
          <div className="space-y-3">
            {([["rows (m)", r, setR], ["columns (n)", c, setC]] as const).map(([l, v, set]) => (
              <label key={l} className="flex items-center gap-3 font-mono text-[13px] text-ink-2">
                <span className="w-24">{l}</span>
                <input type="range" min={1} max={5} value={v} onChange={(e) => set(+e.target.value)} className="accent-[var(--red)]" />
                <span className="w-4 text-ink">{v}</span>
              </label>
            ))}
            {square && r > 1 && (
              <label className="flex items-center gap-2 text-[14px] text-ink-2"><input type="checkbox" checked={ident} onChange={(e) => setIdent(e.target.checked)} className="accent-[var(--red)]" /> make it the identity matrix I</label>
            )}
            <div className="pt-2 text-[16px]">This is <b className="text-red-ink">{kind}</b>, size <b>{r}×{c}</b>.</div>
          </div>
        </div>
      </Stage>

      <H3>The types you need to know</H3>
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead><tr className="border-b-2 border-ink text-[12px] uppercase tracking-[0.12em] text-ink-3"><th className="py-2 pr-4 font-mono font-normal">Name</th><th className="pr-4 font-mono font-normal">Size</th><th className="pr-4 font-mono font-normal">Example</th><th className="font-mono font-normal">What it means</th></tr></thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-line [&_td]:py-4 [&_td]:pr-4 [&_td]:align-middle">
            <tr><td className="font-medium">Row matrix</td><td className="font-mono">1 × n</td><td><Mx data={[[3, 7, 2]]} size="sm" /></td><td className="text-ink-2">Only one row. Often used as a vector.</td></tr>
            <tr><td className="font-medium">Column matrix</td><td className="font-mono">m × 1</td><td><Mx data={[[4], [1], [8]]} size="sm" /></td><td className="text-ink-2">Only one column. The x, y, z in chapter 11 is one of these.</td></tr>
            <tr><td className="font-medium">Square matrix</td><td className="font-mono">n × n</td><td><Mx data={[[9, 13, 5], [1, 11, 7], [2, 6, 3]]} size="sm" /></td><td className="text-ink-2">Same number of rows and columns. Only square matrices have a <b className="text-ink">determinant</b>, an <b className="text-ink">inverse</b>, and <b className="text-ink">powers</b>.</td></tr>
            <tr><td className="font-medium">Identity (I)</td><td className="font-mono">n × n</td><td><Mx data={[[1, 0, 0], [0, 1, 0], [0, 0, 1]]} size="sm" /></td><td className="text-ink-2">1s on the diagonal, 0s elsewhere. Acts like the number 1: A·I = A. You'll need it for inverses.</td></tr>
          </tbody>
        </table>
      </div>
      <Callout kind="slide">Slide 7 lists a square matrix's size as <i>m ∗ n</i>. It should be <b>n × n</b>, because rows and columns are equal.</Callout>
      <QuickCheck q={<>What is the size of <Mx data={[[1, 0], [4, 2], [7, 5], [3, 3]]} size="xs" />?</>} options={["2×4", "4×2", "8", "4×4"]} answer={1}
        explain="Count rows first (4), then columns (2): 4×2." />
    </>
  );
}

// ================================================================ 02 Scalar
export function ScalarLesson() {
  const [c, setC] = useState(4);
  const [work, setWork] = useState(true);
  const A = S.intro;
  return (
    <>
      <Callout kind="idea">A <b>scalar</b> is a regular number, like 4 or −3. To multiply a matrix by a scalar, <b>multiply every entry</b> by that number. The size doesn't change.</Callout>
      <Formula>(cA)<Sub>i,j</Sub> = c · A<Sub>i,j</Sub></Formula>
      <H3>Slide example, with a slider</H3>
      <P>The slide asks for <b className="text-ink">4A</b>. Drag c to any value and watch every entry change together.</P>
      <Stage>
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3 font-mono text-[14px]">c =
            <input type="range" min={-5} max={5} value={c} onChange={(e) => setC(+e.target.value)} className="w-48 accent-[var(--red)]" />
            <b className="w-8 text-[20px] text-red-ink"><Num v={c} /></b>
          </label>
          <Segmented value={work ? "w" : "r"} onChange={(v) => setWork(v === "w")} options={[{ v: "w", label: "show the work" }, { v: "r", label: "result only" }]} />
        </div>
        <Eq className="justify-center gap-x-4">
          <Lbl>A</Lbl><Op>=</Op><Mx data={A} />
          <Op>→</Op>
          <Lbl>{c}A</Lbl><Op>=</Op>
          {work && <><Mx data={A.map((r) => r.map((x) => <span className="text-ink-2">{c < 0 ? `(${c})`.replace("-", "−") : c}(<Num v={x} inline />)</span>))} /><Op>=</Op></>}
          <Mx data={scale(c, A)} tone={() => "row"} />
        </Eq>
      </Stage>
      <Answer label="Slide answer"><Eq><Lbl>4A</Lbl><Op>=</Op><Mx data={scale(4, A)} /></Eq></Answer>
      <Callout kind="tip">If the scalar is <b>negative</b>, every sign flips. Try c = −1 above: 3 becomes −3 and −7 becomes 7.</Callout>
      <QuickCheck q={<>What is −2 · <Mx data={[[1, -3], [0, 5]]} size="xs" />?</>}
        options={[<Mx data={[[-2, 6], [0, -10]]} size="xs" />, <Mx data={[[-2, -6], [0, -10]]} size="xs" />, <Mx data={[[-1, -5], [-2, 3]]} size="xs" />]} answer={0}
        explain="Every entry times −2: (−2)(1) = −2, (−2)(−3) = 6, (−2)(0) = 0, (−2)(5) = −10." />
    </>
  );
}

// ================================================================ 03 Add / subtract
export function AddLesson() {
  const [op, setOp] = useState<"+" | "−">("+");
  const [h, setH] = useState<[number, number]>([1, 1]);
  const P1 = S.addP, Q = S.addQ;
  const R = op === "+" ? add(P1, Q) : sub(P1, Q);
  const tone = (i: number, j: number) => (i === h[0] && j === h[1] ? "hit" as const : undefined);
  const a = P1[h[0]][h[1]], b = Q[h[0]][h[1]];
  return (
    <>
      <Callout kind="idea">You can only add or subtract matrices of the <b>same size</b>. Then add (or subtract) the numbers in the <b>same position</b>: top-left with top-left, and so on.</Callout>
      <Formula>(A ± B)<Sub>i,j</Sub> = A<Sub>i,j</Sub> ± B<Sub>i,j</Sub></Formula>
      <H3>Slide example</H3>
      <P>Both matrices are 3×3, so it's allowed ✓. Hover any cell to see its matching pair. Switch to <b className="text-ink">−</b> for bonus subtraction practice.</P>
      <Stage>
        <div className="mb-6"><Segmented value={op} onChange={setOp} options={[{ v: "+", label: "A + B (slide)" }, { v: "−", label: "A − B (bonus)" }]} /></div>
        <Eq className="justify-center gap-x-4">
          <Mx data={P1} tone={tone} onEnter={(i, j) => setH([i, j])} />
          <Op>{op}</Op>
          <Mx data={Q} tone={tone} onEnter={(i, j) => setH([i, j])} />
          <Op>=</Op>
          <Mx data={R} tone={tone} onEnter={(i, j) => setH([i, j])} />
        </Eq>
        <div className="mt-6 rounded-lg bg-paper-2 px-4 py-3 text-center font-mono text-[15px]">
          position ({h[0] + 1},{h[1] + 1}): <Num v={a} inline /> {op} (<Num v={b} inline />) = <b className="rounded bg-red px-1.5 text-paper"><Num v={op === "+" ? a.add(b) : a.sub(b)} inline /></b>
          {op === "−" && b.sign < 0 && <span className="ml-2 text-ok">minus a negative → plus!</span>}
        </div>
      </Stage>
      <Answer label="Slide answer"><Eq><Mx data={P1} size="sm" /><Op>+</Op><Mx data={Q} size="sm" /><Op>=</Op><Mx data={add(P1, Q)} /></Eq></Answer>
      <Callout kind="warn">A 2×3 matrix plus a 3×2 matrix is <b>not defined</b>. The sizes must match exactly, or there's nothing to pair up.</Callout>
      <QuickCheck q="Can you add a 3×1 matrix and a 1×3 matrix?" options={["Yes, the answer is 3×3", "Yes, the answer is 1×1", "No, not defined"]} answer={2}
        explain="Addition needs the exact same size. 3×1 and 1×3 are different sizes." />
    </>
  );
}

// ================================================================ 04 Transpose
export function TransposeLesson() {
  return (
    <>
      <Callout kind="idea">The <b>transpose</b> A<sup>T</sup> flips the matrix: <b>row 1 becomes column 1</b>, row 2 becomes column 2, and so on. An m×n matrix becomes <b>n×m</b>.</Callout>
      <Formula>(A<sup>T</sup>)<Sub>i,j</Sub> = A<Sub>j,i</Sub></Formula>
      <P>Other notations you may see: A<sup>tr</sup> or <sup>t</sup>A. Press the button and follow the colors. Each colored row slides into place as a column.</P>
      <Stage><TransposeFlip A={S.tr} /></Stage>
      <Answer label="Slide answer"><Eq><Mx data={S.tr} /><Op>ᵀ =</Op><Mx data={[[1, 3, 5], [2, 4, 6]]} /></Eq></Answer>
      <Callout kind="tip">Transposing twice brings you back: (A<sup>T</sup>)<sup>T</sup> = A. You'll use the transpose again in <b>Problem Set 5 #10</b> and in the <b>adjugate</b> step for inverses.</Callout>
      <QuickCheck q={<>If A is 2×5, what size is A<sup>T</sup>?</>} options={["2×5", "5×2", "10×1"]} answer={1} explain="Rows and columns swap: 2×5 becomes 5×2." />
    </>
  );
}

// ================================================================ 05 Multiplication
export function MultiplyLesson() {
  const [dims, setDims] = useState([2, 3, 3, 4]);
  const ok = dims[1] === dims[2];
  return (
    <>
      <Callout kind="idea">Matrix multiplication is <b>not</b> position by position. Each answer entry takes a <b>row of the left matrix</b> and a <b>column of the right matrix</b>, multiplies the matching numbers, and <b>adds</b> them up. This is called the <b>dot product</b>.</Callout>

      <H3>Rule 1: check the sizes first</H3>
      <Formula>A<Sub>m×<b className="text-ok">n</b></Sub> · B<Sub><b className="text-ok">n</b>×p</Sub> = C<Sub>m×p</Sub></Formula>
      <P>The <b className="text-ink">inner</b> numbers must match. The <b className="text-ink">outer</b> numbers give the answer's size. Try some sizes:</P>
      <Stage>
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[18px]">
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="flex items-center gap-3">
              {k === 2 && <span className="text-ink-3">·</span>}
              <select value={dims[k]} onChange={(e) => setDims((d) => d.map((x, q) => (q === k ? +e.target.value : x)))}
                className={`rounded-lg border bg-paper px-2 py-1.5 ${k === 1 || k === 2 ? (ok ? "border-ok text-ok" : "border-bad text-bad") : "border-line-2"}`}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {(k === 0 || k === 2) && <span className="text-ink-3">×</span>}
            </span>
          ))}
          <span className="text-ink-3">→</span>
          {ok ? <span className="rounded-lg bg-ok-soft px-3 py-1.5 text-ok">defined, answer is {dims[0]}×{dims[3]}</span> : <span className="rounded-lg bg-bad-soft px-3 py-1.5 text-bad">not defined ({dims[1]} ≠ {dims[2]})</span>}
        </div>
      </Stage>

      <H3>Rule 2: row × column</H3>
      <Formula>[AB]<Sub>i,j</Sub> = a<Sub>i,1</Sub>b<Sub>1,j</Sub> + a<Sub>i,2</Sub>b<Sub>2,j</Sub> + ⋯ + a<Sub>i,n</Sub>b<Sub>n,j</Sub></Formula>
      <Callout kind="slide">On slide 18 the last term is typed as a<Sub>i,1</Sub>b<Sub>1,j</Sub>. It should be <b>a<Sub>i,n</Sub>b<Sub>n,j</Sub></b> (the last pair).</Callout>

      <H3>Slide example (slide 19)</H3>
      <P>Hover or tap any cell of the answer. Turn on <b className="text-ink">Quiz me</b> to hide the answers and test yourself one cell at a time.</P>
      <Stage><MulExplorer A={S.mulL} B={S.mulR} an="L" bn="R" cn="L·R" /></Stage>
      <Callout kind="warn"><b>Order matters.</b> Usually A·B ≠ B·A. Sometimes one of them isn't even defined. You'll see this in Problem Set 5, #1 vs #9.</Callout>

      <H3>Exercise 1 (slide 20)</H3>
      <P>Compute the product. Turn on <b className="text-ink">Quiz me</b>, work out each of the 8 entries on paper, then tap to check.</P>
      <Stage><MulExplorer A={S.ex1L} B={S.ex1R} an="L" bn="R" cn="L·R" startQuiz /></Stage>
      <QuickCheck q="A is 3×2 and B is 2×4. What is the size of A·B?" options={["3×4", "2×2", "4×3", "not defined"]} answer={0} explain="(3×2)(2×4): inner 2 = 2 ✓, outer numbers give 3×4." />
    </>
  );
}

// ================================================================ 06 Power
export function PowerLesson() {
  const [k, setK] = useState(2);
  const A = S.pow;
  return (
    <>
      <Callout kind="idea">A<sup>2</sup> means <b>A · A</b>, matrix multiplication of A with itself. A<sup>3</sup> = A<sup>2</sup> · A, and so on. Only <b>square</b> matrices can do this, because (m×<b>n</b>)(<b>m</b>×n) needs n = m.</Callout>
      <div className="my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-bad/40 bg-bad-soft/50 p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-bad">✗ wrong: squaring each entry</div>
          <Eq className="mt-3"><Mx data={A} size="sm" /><Op>²</Op><Op>≠</Op><Mx data={A.map((r) => r.map((x) => x.mul(x)))} size="sm" /></Eq>
        </div>
        <div className="rounded-2xl border border-ok/40 bg-ok-soft/50 p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ok">✓ right: A · A</div>
          <Eq className="mt-3"><Mx data={A} size="sm" /><Op>²</Op><Op>=</Op><Mx data={power(A, 2)} size="sm" /></Eq>
        </div>
      </div>
      <H3>Slide example (slide 21)</H3>
      <Stage><MulExplorer A={A} B={A} an="A" bn="A" cn="A²" /></Stage>
      <H3>Keep going: higher powers</H3>
      <P>Each power multiplies the previous result by A once more. The numbers grow fast!</P>
      <Stage>
        <div className="mb-5 flex items-center gap-3 font-mono text-[14px]">k =
          <input type="range" min={1} max={5} value={k} onChange={(e) => setK(+e.target.value)} className="w-40 accent-[var(--red)]" /><b className="text-[20px] text-red-ink">{k}</b></div>
        <Eq className="justify-center">
          <Lbl>A<sup>{k}</sup></Lbl><Op>=</Op>
          {k > 1 && <><Lbl>A<sup>{k - 1}</sup></Lbl><Op>·</Op><Lbl>A</Lbl><Op>=</Op><Mx data={power(A, k - 1)} size="sm" /><Op>·</Op><Mx data={A} size="sm" /><Op>=</Op></>}
          <Mx data={power(A, k)} tone={() => "row"} />
        </Eq>
      </Stage>
      <QuickCheck q={<>Is <Mx data={[[1, 2, 3], [4, 5, 6]]} size="xs" /><sup>2</sup> defined?</>} options={["Yes", "No"]} answer={1} explain="It's 2×3, not square: (2×3)(2×3) has inner numbers 3 ≠ 2." />
    </>
  );
}

