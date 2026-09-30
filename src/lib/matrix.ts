import { Fr, fr } from "./frac";

export type M = Fr[][];

export const toM = (rows: (number | Fr)[][]): M => rows.map((r) => r.map(fr));
export const rowsOf = (A: M) => A.length;
export const colsOf = (A: M) => A[0]?.length ?? 0;
export const sizeStr = (A: M) => `${rowsOf(A)}×${colsOf(A)}`;
export const isSquare = (A: M) => rowsOf(A) === colsOf(A);
export const sameSize = (A: M, B: M) => rowsOf(A) === rowsOf(B) && colsOf(A) === colsOf(B);
export const canMultiply = (A: M, B: M) => colsOf(A) === rowsOf(B);

export const identity = (n: number): M =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => fr(i === j ? 1 : 0)));
export const zeros = (r: number, c: number): M =>
  Array.from({ length: r }, () => Array.from({ length: c }, () => fr(0)));

export const add = (A: M, B: M): M => A.map((r, i) => r.map((x, j) => x.add(B[i][j])));
export const sub = (A: M, B: M): M => A.map((r, i) => r.map((x, j) => x.sub(B[i][j])));
export const scale = (c: Fr | number, A: M): M => A.map((r) => r.map((x) => x.mul(c)));
export const transpose = (A: M): M => A[0].map((_, j) => A.map((r) => r[j]));

/** The pairs that get multiplied for entry (i, j) of A·B. */
export const dotPairs = (A: M, B: M, i: number, j: number) => A[i].map((a, k) => [a, B[k][j]] as const);
export const dot = (A: M, B: M, i: number, j: number) =>
  dotPairs(A, B, i, j).reduce((s, [a, b]) => s.add(a.mul(b)), fr(0));
export const mul = (A: M, B: M): M =>
  A.map((_, i) => B[0].map((_, j) => dot(A, B, i, j)));

export const power = (A: M, k: number): M => {
  let R = A;
  for (let i = 1; i < k; i++) R = mul(R, A);
  return R;
};

/** Remove row i and column j. */
export const minorMatrix = (A: M, i: number, j: number): M =>
  A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));

export const det = (A: M): Fr => {
  const n = rowsOf(A);
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0].mul(A[1][1]).sub(A[0][1].mul(A[1][0]));
  return A[0].reduce((s, a, j) => {
    const term = a.mul(det(minorMatrix(A, 0, j)));
    return j % 2 === 0 ? s.add(term) : s.sub(term);
  }, fr(0));
};

/** Sarrus terms for a 3×3: [label, factors, product] for the + and − diagonals. */
export function sarrus(A: M) {
  const [[a, b, c], [d, e, f], [g, h, i]] = A;
  const plus = [
    { label: "aei", f: [a, e, i], pos: [[0, 0], [1, 1], [2, 2]] },
    { label: "bfg", f: [b, f, g], pos: [[0, 1], [1, 2], [2, 0]] },
    { label: "cdh", f: [c, d, h], pos: [[0, 2], [1, 0], [2, 1]] },
  ];
  const minus = [
    { label: "ceg", f: [c, e, g], pos: [[0, 2], [1, 1], [2, 0]] },
    { label: "afh", f: [a, f, h], pos: [[0, 0], [1, 2], [2, 1]] },
    { label: "bdi", f: [b, d, i], pos: [[0, 1], [1, 0], [2, 2]] },
  ];
  const withP = <T extends { f: Fr[] }>(t: T) => ({ ...t, p: t.f.reduce((s, x) => s.mul(x), fr(1)) });
  const P = plus.map(withP);
  const N = minus.map(withP);
  const sumP = P.reduce((s, t) => s.add(t.p), fr(0));
  const sumN = N.reduce((s, t) => s.add(t.p), fr(0));
  return { plus: P, minus: N, sumP, sumN, det: sumP.sub(sumN) };
}

export const minorsOf = (A: M): M => A.map((r, i) => r.map((_, j) => det(minorMatrix(A, i, j))));
export const cofactorsOf = (A: M): M =>
  minorsOf(A).map((r, i) => r.map((x, j) => ((i + j) % 2 === 0 ? x : x.neg())));
export const adjugate = (A: M): M => transpose(cofactorsOf(A));

export const inverse = (A: M): M | null => {
  const D = det(A);
  if (D.isZero) return null;
  if (rowsOf(A) === 1) return [[fr(1).div(D)]];
  return scale(fr(1).div(D), adjugate(A));
};

// ------------------------------------------------------------ Gauss-Jordan
export type RowOp =
  | { kind: "swap"; a: number; b: number }
  | { kind: "scale"; a: number; c: Fr }
  | { kind: "addmul"; a: number; b: number; c: Fr }; // Ra → Ra + c·Rb

export const applyOp = (Aug: M, op: RowOp): M => {
  const R = Aug.map((r) => [...r]);
  if (op.kind === "swap") [R[op.a], R[op.b]] = [R[op.b], R[op.a]];
  else if (op.kind === "scale") R[op.a] = R[op.a].map((x) => x.mul(op.c));
  else R[op.a] = R[op.a].map((x, k) => x.add(op.c.mul(Aug[op.b][k])));
  return R;
};

export const augment = (A: M, B: M): M => A.map((r, i) => [...r, ...B[i]]);

/** Chooses row operations automatically (used by the Matrix Lab). */
export function autoGaussJordan(A: M): { ops: RowOp[]; singular: boolean } {
  const n = rowsOf(A);
  let W = augment(A, identity(n));
  const ops: RowOp[] = [];
  const push = (op: RowOp) => { ops.push(op); W = applyOp(W, op); };
  for (let col = 0; col < n; col++) {
    let pivot = -1;
    for (let r = col; r < n; r++) if (!W[r][col].isZero) { pivot = r; break; }
    if (pivot < 0) return { ops, singular: true };
    if (pivot !== col) push({ kind: "swap", a: col, b: pivot });
    if (!W[col][col].eq(1)) push({ kind: "scale", a: col, c: fr(1).div(W[col][col]) });
    for (let r = 0; r < n; r++) {
      if (r !== col && !W[r][col].isZero) push({ kind: "addmul", a: r, b: col, c: W[r][col].neg() });
    }
  }
  return { ops, singular: false };
}

export const opLabel = (op: RowOp, fmt: (x: Fr) => string): string => {
  if (op.kind === "swap") return `R${op.a + 1} ↔ R${op.b + 1}`;
  if (op.kind === "scale") return `R${op.a + 1} → ${fmt(op.c)}·R${op.a + 1}`;
  const c = op.c;
  const mag = c.sign < 0 ? c.neg() : c;
  const coef = mag.eq(1) ? "" : `${fmt(mag)}·`;
  return `R${op.a + 1} → R${op.a + 1} ${c.sign < 0 ? "−" : "+"} ${coef}R${op.b + 1}`;
};
