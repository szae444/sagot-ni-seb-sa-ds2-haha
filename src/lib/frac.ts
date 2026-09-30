// Exact rational numbers, so answers like 9/7 never turn into 1.2857142...
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export class Fr {
  readonly n: number;
  readonly d: number;

  constructor(n: number, d = 1) {
    if (d === 0) throw new Error("Division by zero");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(Math.abs(n), d) || 1;
    this.n = n / g + 0; // +0 turns -0 into 0
    this.d = d / g;
  }

  static of(x: number | Fr): Fr {
    if (x instanceof Fr) return x;
    if (Number.isInteger(x)) return new Fr(x);
    // turn a short decimal like 0.25 into 1/4
    let d = 1;
    while (!Number.isInteger(x * d) && d < 1e9) d *= 10;
    return new Fr(Math.round(x * d), d);
  }

  add(o: Fr | number) { const b = Fr.of(o); return new Fr(this.n * b.d + b.n * this.d, this.d * b.d); }
  sub(o: Fr | number) { const b = Fr.of(o); return new Fr(this.n * b.d - b.n * this.d, this.d * b.d); }
  mul(o: Fr | number) { const b = Fr.of(o); return new Fr(this.n * b.n, this.d * b.d); }
  div(o: Fr | number) { const b = Fr.of(o); return new Fr(this.n * b.d, this.d * b.n); }
  neg() { return new Fr(-this.n, this.d); }
  get isZero() { return this.n === 0; }
  get isInt() { return this.d === 1; }
  get sign() { return Math.sign(this.n); }
  eq(o: Fr | number) { const b = Fr.of(o); return this.n === b.n && this.d === b.d; }
  valueOf() { return this.n / this.d; }
  toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
}

export const fr = (x: number | Fr) => Fr.of(x);

/** Parses what a person types: "3", "-2", "3/4", "-0.5", "−1/7". Returns null if it can't. */
export function parseFr(raw: string): Fr | null {
  const s = raw.trim().replace(/−/g, "-").replace(/\s+/g, "");
  if (!s) return null;
  if (/^[-+]?\d+\/[-+]?\d+$/.test(s)) {
    const [a, b] = s.split("/").map(Number);
    return b === 0 ? null : new Fr(a, b);
  }
  if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return Fr.of(Number(s));
  return null;
}

/** Plain-text form using a real minus sign, e.g. "−3/7". */
export const txt = (x: Fr | number) => Fr.of(x).toString().replace("-", "−");
