import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { Btn, Kbd, Mx, Sub } from "../components/ui";

const CARDS: { q: ReactNode; a: ReactNode }[] = [
  { q: "How do you read the size of a matrix?", a: <>rows × columns (<b>RC</b>). A 2×3 matrix has 2 rows and 3 columns.</> },
  { q: <>What does a<Sub>23</Sub> mean?</>, a: "The entry in row 2, column 3." },
  { q: "What is a square matrix?", a: "Same number of rows and columns (n × n). Only square matrices have a determinant, an inverse, and powers." },
  { q: "What is the identity matrix I?", a: <><Mx data={[[1, 0, 0], [0, 1, 0], [0, 0, 1]]} size="sm" /><div className="mt-2">1s on the diagonal, 0s elsewhere. A·I = A.</div></> },
  { q: "How do you multiply a matrix by a scalar c?", a: "Multiply every entry by c. The size stays the same." },
  { q: "When can you add two matrices?", a: "Only when they are the exact same size. Then add position by position." },
  { q: <>What does the transpose A<sup>T</sup> do?</>, a: "Rows become columns. An m×n matrix becomes n×m." },
  { q: "When is A·B defined?", a: <>When columns of A = rows of B: (m×<b>n</b>)(<b>n</b>×p). The answer is m×p.</> },
  { q: "How do you get entry (i, j) of A·B?", a: "Row i of A · column j of B: multiply the matching numbers, then add." },
  { q: "Is A·B always equal to B·A?", a: "No! Order matters. One can even be defined while the other isn't." },
  { q: <>What is A<sup>2</sup>?</>, a: "A · A (matrix multiplication). NOT each entry squared. A must be square." },
  { q: "det of a 2×2 [a b; c d]?", a: <b className="font-mono">ad − bc</b> },
  { q: "det of a 3×3 (Sarrus)?", a: <b className="font-mono">aei + bfg + cdh − ceg − afh − bdi</b> },
  { q: "How do you find the determinant of a 4×4?", a: <>Cofactor expansion along row 1: a|M<Sub>11</Sub>| − b|M<Sub>12</Sub>| + c|M<Sub>13</Sub>| − d|M<Sub>14</Sub>|</> },
  { q: "What does det A = 0 tell you?", a: "A has no inverse (and AX = B has no single solution)." },
  { q: "Inverse of a 2×2 [a b; c d]?", a: <>(1/det) · [d −b; −c a]. Swap a and d, negate b and c, divide by det.</> },
  { q: "Gauss-Jordan in one line?", a: "[A | I] → row operations → [I | A⁻¹]" },
  { q: "The 3 elementary row operations?", a: "Swap two rows · multiply a row by a non-zero number · add a multiple of one row to another." },
  { q: "The 4 steps of the adjugate method?", a: "Matrix of minors → cofactors (+ − + pattern) → adjugate (transpose) → multiply by 1/det." },
  { q: "What is a minor?", a: "Cover an entry's row and column, then take the determinant of what's left." },
  { q: "Cofactor sign pattern for 3×3?", a: <Mx data={[["+", "−", "+"], ["−", "+", "−"], ["+", "−", "+"]]} size="sm" /> },
  { q: "How do you solve a system with matrices?", a: <>Write AX = B, then <b>X = A⁻¹B</b>.</> },
  { q: "In AX = B, what are A, X and B?", a: "A = coefficients, X = column of variables, B = column of constants." },
  { q: <>Answer to the slides' system: x + y + z = 6, 2y + 5z = −4, 2x + 5y − z = 27?</>, a: <b className="font-mono">x = 5, y = 3, z = −2</b> },
];

const shuffle = (n: number) => Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);

export function Flashcards() {
  const [deck, setDeck] = useState<number[]>(() => Array.from({ length: CARDS.length }, (_, i) => i));
  const [pos, setPos] = useState(0);
  const [flip, setFlip] = useState(false);
  const [again, setAgain] = useState<number[]>([]);
  const [got, setGot] = useState(0);
  const done = pos >= deck.length;
  const card = CARDS[deck[pos]];

  const answer = (ok: boolean) => {
    if (done) return;
    if (ok) setGot((g) => g + 1); else setAgain((a) => [...a, deck[pos]]);
    setFlip(false);
    setPos((p) => p + 1);
  };
  const restart = (ids: number[]) => { setDeck(ids); setPos(0); setFlip(false); setAgain([]); setGot(0); };

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === " ") { e.preventDefault(); setFlip((x) => !x); }
      if (e.key === "1" || e.key === "ArrowLeft") answer(false);
      if (e.key === "2" || e.key === "ArrowRight") answer(true);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  return (
    <div className="mx-auto max-w-[900px] px-5 pt-10 pb-24 sm:px-10 lg:pt-16">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-red-ink">Tool</div>
          <h1 className="mt-3 font-display text-[64px] leading-none">Flashcards</h1>
          <p className="mt-4 max-w-[48ch] text-[17px] text-ink-2">{CARDS.length} rules and formulas. Say the answer out loud, flip, then be honest.</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => restart(shuffle(CARDS.length))}>⤮ Shuffle</Btn>
          <Btn kind="quiet" onClick={() => restart(Array.from({ length: CARDS.length }, (_, i) => i))}>Restart</Btn>
        </div>
      </header>

      <div className="mt-6 flex items-center gap-4 font-mono text-[12px] text-ink-3">
        <span>{Math.min(pos + 1, deck.length)} / {deck.length}</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-red transition-[width] duration-500" style={{ width: `${(pos / deck.length) * 100}%` }} /></div>
        <span className="text-ok">✓ {got}</span><span className="text-bad">↺ {again.length}</span>
      </div>

      {done ? (
        <div className="mt-10 rounded-3xl border border-line bg-card p-12 text-center shadow-[var(--shadow)]">
          <div className="font-display text-[56px] leading-none">{again.length ? "Almost there." : "Deck cleared!"}</div>
          <p className="mt-4 text-[17px] text-ink-2">You knew {got} of {deck.length}.{again.length ? ` ${again.length} card${again.length > 1 ? "s" : ""} to go over again.` : " Kaya mo talaga."}</p>
          <div className="mt-8 flex justify-center gap-3">
            {again.length > 0 && <Btn kind="solid" onClick={() => restart(again)}>Review the {again.length} missed</Btn>}
            <Btn onClick={() => restart(shuffle(CARDS.length))}>Start over, shuffled</Btn>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 [perspective:1400px]">
            <motion.button type="button" onClick={() => setFlip((x) => !x)} animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative block h-[340px] w-full [transform-style:preserve-3d]" aria-label="Flip card">
              <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-line bg-card p-10 text-left shadow-[var(--shadow)] [backface-visibility:hidden]">
                <span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-red-ink">Question</span>
                <span className="font-display text-[38px] leading-[1.1] text-ink sm:text-[44px]">{card.q}</span>
                <span className="text-[13px] text-ink-3">Click or press <Kbd>Space</Kbd> to flip</span>
              </div>
              <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-[#5c0f18] p-10 text-left text-[#fbeae6] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-[#f3b7b0]">Answer</span>
                <span className="text-[22px] leading-relaxed [&_.mx]:text-[#fbeae6] [&_td]:text-[#fbeae6]">{card.a}</span>
                <span className="text-[13px] text-[#f0cfc9]">Did you get it?</span>
              </div>
            </motion.button>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Btn onClick={() => answer(false)} className="!px-6">↺ Again <Kbd>1</Kbd></Btn>
            <Btn kind="solid" onClick={() => answer(true)} className="!px-6">✓ Got it <span className="rounded border border-paper/40 px-1.5 font-mono text-[11px]">2</span></Btn>
          </div>
        </>
      )}
    </div>
  );
}
