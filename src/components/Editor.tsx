import { type Fr, parseFr, txt } from "../lib/frac";
import type { M } from "../lib/matrix";

export type Grid = string[][];
export const gridOf = (A: M): Grid => A.map((r) => r.map(txt));
/** Returns the matrix, or null if any box has something that isn't a number. */
export const parseGrid = (g: Grid): M | null => {
  const out = g.map((r) => r.map(parseFr));
  return out.every((r) => r.every((x) => x !== null)) ? (out as Fr[][]) : null;
};

const resize = (g: Grid, r: number, c: number): Grid =>
  Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => g[i]?.[j] ?? "0"));

/** An editable matrix with bracket sides and optional size steppers. */
export function MatrixEditor({ value, onChange, label, min = 1, max = 5, resizable = true, square = false, cellClass }: {
  value: Grid; onChange: (g: Grid) => void; label?: string; min?: number; max?: number; resizable?: boolean; square?: boolean;
  cellClass?: (i: number, j: number) => string;
}) {
  const r = value.length, c = value[0].length;
  const set = (i: number, j: number, v: string) => onChange(value.map((row, a) => row.map((x, b) => (a === i && b === j ? v : x))));
  const Step = ({ what, n, onSet }: { what: string; n: number; onSet: (n: number) => void }) => (
    <div className="flex items-center gap-1 font-mono text-[12px] text-ink-3">
      <span className="w-9">{what}</span>
      <button type="button" aria-label={`fewer ${what}`} onClick={() => onSet(Math.max(min, n - 1))} className="h-6 w-6 rounded-full border border-line-2 hover:border-red hover:text-red-ink">−</button>
      <span className="w-4 text-center text-ink">{n}</span>
      <button type="button" aria-label={`more ${what}`} onClick={() => onSet(Math.min(max, n + 1))} className="h-6 w-6 rounded-full border border-line-2 hover:border-red hover:text-red-ink">+</button>
    </div>
  );
  return (
    <div className="inline-flex flex-col items-center gap-2">
      {label && <div className="font-display text-[26px] italic leading-none">{label}</div>}
      <span className="mx text-ink">
        <table className="border-separate border-spacing-1">
          <tbody>
            {value.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => {
                  const bad = parseFr(v) === null;
                  return (
                    <td key={j}>
                      <input value={v} inputMode="text" aria-label={`${label ?? "matrix"} row ${i + 1} column ${j + 1}`}
                        onChange={(e) => set(i, j, e.target.value)} onFocus={(e) => e.target.select()}
                        className={`h-9 w-14 rounded-md border bg-paper text-center font-mono text-[14px] outline-none transition-colors focus:border-red ${
                          bad ? "border-bad bg-bad-soft" : "border-line"} ${cellClass?.(i, j) ?? ""}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </span>
      {resizable && (
        <div className="flex gap-4">
          <Step what="rows" n={r} onSet={(n) => onChange(resize(value, n, square ? n : c))} />
          {!square && <Step what="cols" n={c} onSet={(n) => onChange(resize(value, r, n))} />}
        </div>
      )}
    </div>
  );
}
