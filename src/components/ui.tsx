import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { Fr } from "../lib/frac";

// ---------------------------------------------------------------- numbers
const MINUS = "−";

/** Shows an integer or a stacked fraction, always with a real minus sign. */
export function Num({ v, inline = false, paren = false }: { v: Fr | number; inline?: boolean; paren?: boolean }) {
  const x = Fr.of(v);
  const neg = x.n < 0;
  const n = Math.abs(x.n);
  let body: ReactNode;
  if (x.d === 1) body = `${neg ? MINUS : ""}${n}`;
  else if (inline) body = `${neg ? MINUS : ""}${n}/${x.d}`;
  else body = (<>{neg ? MINUS : ""}<span className="frac"><span>{n}</span><span>{x.d}</span></span></>);
  return paren ? <>({body})</> : <>{body}</>;
}

/** Joins signed values as "a + b − c". */
export function Terms({ vals }: { vals: Fr[] }) {
  return (
    <>
      {vals.map((v, k) => (
        <span key={k}>
          {k === 0 ? <Num v={v} inline /> : v.sign < 0 ? <> {MINUS} <Num v={v.neg()} inline /></> : <> + <Num v={v} inline /></>}
        </span>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- matrix
export type Tone = "row" | "col" | "hit" | "dim" | "ok" | "bad" | "pick" | "c1" | "c2" | "c3" | "soft" | undefined;
const TONE: Record<Exclude<Tone, undefined>, string> = {
  row: "bg-red-soft text-red-ink",
  col: "bg-sand text-sand-ink",
  hit: "bg-red text-paper",
  dim: "opacity-25",
  ok: "bg-ok-soft text-ok",
  bad: "bg-bad-soft text-bad",
  pick: "bg-red text-paper",
  c1: "bg-red-soft text-red-ink",
  c2: "bg-sand text-sand-ink",
  c3: "bg-ok-soft text-ok",
  soft: "bg-paper-2",
};

type Cell = Fr | number | string | ReactNode;
export function Mx({
  data, tone, onEnter, onLeave, onClick, size = "md", bars = false, split, className = "",
}: {
  data: Cell[][];
  tone?: (i: number, j: number) => Tone;
  onEnter?: (i: number, j: number) => void;
  onLeave?: () => void;
  onClick?: (i: number, j: number) => void;
  size?: "xs" | "sm" | "md" | "lg";
  bars?: boolean;
  split?: number;
  className?: string;
}) {
  const pad = { xs: "px-1 py-px text-[12px] min-w-[1.6em]", sm: "px-1.5 py-0.5 text-[13px] min-w-[2em]", md: "px-2 py-1 text-[15px] min-w-[2.4em]", lg: "px-3 py-1.5 text-[19px] min-w-[2.6em]" }[size];
  const interactive = !!(onEnter || onClick);
  return (
    <span className={`mx ${bars ? "bars" : ""} text-ink ${className}`} onMouseLeave={onLeave}>
      <table className="border-separate border-spacing-[2px]">
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => {
                const t = tone?.(i, j);
                const content = v instanceof Fr || typeof v === "number" ? <Num v={v} /> : v;
                return (
                  <td
                    key={j}
                    onMouseEnter={onEnter ? () => onEnter(i, j) : undefined}
                    onClick={onClick ? () => onClick(i, j) : undefined}
                    className={`cell rounded-[5px] text-center font-mono tabular-nums whitespace-nowrap ${pad} ${t ? TONE[t] : ""} ${
                      split !== undefined && j === split ? "border-l border-dashed border-ink-3 !pl-3" : ""
                    } ${interactive ? "cursor-pointer hover:ring-1 hover:ring-red/50" : ""}`}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </span>
  );
}

/** A horizontal math line: matrices, operators and labels, vertically centred. */
export function Eq({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[15px] text-ink ${className}`}>{children}</div>;
}
export const Op = ({ children }: { children: ReactNode }) => <span className="text-ink-3">{children}</span>;
export const Lbl = ({ children }: { children: ReactNode }) => <span className="font-display text-[26px] italic leading-none">{children}</span>;

// ---------------------------------------------------------------- text blocks
const CALLOUT = {
  idea: { label: "The idea", cls: "border-red bg-red-tint", lab: "text-red-ink" },
  tip: { label: "Tip", cls: "border-ok bg-ok-soft/60", lab: "text-ok" },
  warn: { label: "Common mistake", cls: "border-bad bg-bad-soft/70", lab: "text-bad" },
  slide: { label: "Slide erratum", cls: "border-sand-ink bg-sand/50", lab: "text-sand-ink" },
} as const;

export function Callout({ kind, title, children }: { kind: keyof typeof CALLOUT; title?: string; children: ReactNode }) {
  const c = CALLOUT[kind];
  return (
    <div className={`my-6 border-l-[3px] ${c.cls} rounded-r-lg px-5 py-4`}>
      <div className={`mb-1 font-mono text-[11px] uppercase tracking-[0.14em] ${c.lab}`}>{title ?? c.label}</div>
      <div className="text-[15.5px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex justify-center">
      <div className="rounded-xl border border-line bg-card px-6 py-4 font-mono text-[16px] shadow-[var(--shadow)]">{children}</div>
    </div>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return <h3 id={id} className="mt-14 mb-3 scroll-mt-24 font-display text-[30px] leading-tight text-ink">{children}</h3>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-3 max-w-[68ch] text-[16.5px] leading-[1.7] text-ink-2">{children}</p>;
}

/** Breaks out of the reading column for wide widgets. */
export function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`my-8 overflow-x-auto rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, kind = "ghost", className = "", disabled, title }: {
  children: ReactNode; onClick?: () => void; kind?: "solid" | "ghost" | "quiet"; className?: string; disabled?: boolean; title?: string;
}) {
  const k = {
    solid: "bg-red text-paper hover:brightness-110 active:translate-y-px",
    ghost: "border border-line-2 bg-card text-ink hover:border-red hover:text-red-ink active:translate-y-px",
    quiet: "text-ink-2 hover:text-red-ink hover:bg-red-tint",
  }[kind];
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ${k} ${className}`}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-paper-2 p-1">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={`rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors duration-200 ${value === o.v ? "bg-card text-red-ink shadow-[var(--shadow)]" : "text-ink-2 hover:text-ink"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** "Try it first" block: hides the solution until asked. */
export function Reveal({ children, label = "Show the solution", defaultOpen = false }: { children: ReactNode; label?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="my-4">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="group inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.12em] text-red-ink">
        <span className={`inline-block transition-transform duration-300 ${open ? "rotate-90" : ""}`}>▸</span>
        <span className="link-u">{open ? "Hide the solution" : label}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Answer({ children, label = "Answer" }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-5 flex items-stretch overflow-hidden rounded-xl border border-ok/50 bg-ok-soft/50">
      <div className="flex items-center bg-ok px-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper [writing-mode:vertical-rl] rotate-180">{label}</div>
      <div className="flex-1 overflow-x-auto px-5 py-4">{children}</div>
    </div>
  );
}

/** Checks (m×n)(n×p) and says whether a product is defined. */
export function SizeCheck({ a, b, an = "A", bn = "B" }: { a: [number, number]; b: [number, number]; an?: string; bn?: string }) {
  const ok = a[1] === b[0];
  const inner = `rounded-md px-1.5 ${ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`;
  return (
    <div className="my-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-dashed border-line-2 px-4 py-2.5 font-mono text-[14px]">
      <span className="text-ink-2">{an}</span>
      <span>{a[0]}×<b className={inner}>{a[1]}</b></span>
      <span className="text-ink-3">·</span>
      <span className="text-ink-2">{bn}</span>
      <span><b className={inner}>{b[0]}</b>×{b[1]}</span>
      <span className="text-ink-3">→</span>
      {ok ? (
        <span className="text-ok">inner {a[1]} = {b[0]} ✓ answer is <b>{a[0]}×{b[1]}</b></span>
      ) : (
        <span className="text-bad">inner {a[1]} ≠ {b[0]} ✗ <b>not defined</b></span>
      )}
    </div>
  );
}

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded border border-line-2 bg-paper-2 px-1.5 py-px font-mono text-[11px] text-ink-2">{children}</kbd>
);

export const Sub = ({ children }: { children: ReactNode }) => <sub className="text-[0.7em]">{children}</sub>;
