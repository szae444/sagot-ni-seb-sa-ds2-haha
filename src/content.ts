import { toM } from "./lib/matrix";

export type Chapter = { id: string; num: string; title: string; blurb: string; slides: string; kind: "lesson" | "solve" };

export const CHAPTERS: Chapter[] = [
  { id: "matrix", num: "01", title: "What is a Matrix?", blurb: "Rows, columns, size, entries, and the four types you need to know.", slides: "Slides 5–7", kind: "lesson" },
  { id: "scalar", num: "02", title: "Scalar Multiplication", blurb: "One number times every entry. Drag a slider and watch it happen.", slides: "Slides 9–11", kind: "lesson" },
  { id: "add", num: "03", title: "Addition & Subtraction", blurb: "Same size only, position by position.", slides: "Slides 12–14", kind: "lesson" },
  { id: "transpose", num: "04", title: "Transpose", blurb: "Rows become columns. Watch the numbers move.", slides: "Slides 15–17", kind: "lesson" },
  { id: "multiply", num: "05", title: "Matrix Multiplication", blurb: "Row × column, the dot product. Includes Exercise 1.", slides: "Slides 18–20", kind: "lesson" },
  { id: "power", num: "06", title: "Power of a Matrix", blurb: "A² means A·A, not squaring each number.", slides: "Slide 21", kind: "lesson" },
  { id: "exercise-2", num: "07", title: "Exercise 2", blurb: "Seven products: which are defined, and what are they?", slides: "Slide 22", kind: "solve" },
  { id: "problem-set-5", num: "08", title: "Problem Set 5", blurb: "All ten items, solved with every step shown.", slides: "Slide 23", kind: "solve" },
  { id: "determinant", num: "09", title: "Determinant", blurb: "ad − bc, the Sarrus diagonals, and cofactor expansion for 4×4.", slides: "Slides 25–26", kind: "lesson" },
  { id: "inverse", num: "10", title: "Inverse of a Matrix", blurb: "The 2×2 shortcut, Gauss-Jordan, and minors → cofactors → adjugate.", slides: "Slides 27–44", kind: "lesson" },
  { id: "systems", num: "11", title: "Solving x, y, z", blurb: "The practical application: AX = B, so X = A⁻¹B.", slides: "Slides 46–63", kind: "lesson" },
  { id: "cheatsheet", num: "12", title: "Cheat Sheet & Mistakes", blurb: "Every rule on one page, plus the traps to avoid.", slides: "Summary", kind: "lesson" },
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);

// ---------------------------------------------------------------- matrices from the slides
export const S = {
  intro: toM([[3, 5, 12], [-1, -7, 4]]),
  addP: toM([[1, -4, 8], [11, 2, 24], [12, 4, 1]]),
  addQ: toM([[-9, 8, 6], [0, 15, 2], [3, 14, 0]]),
  tr: toM([[1, 2], [3, 4], [5, 6]]),
  mulL: toM([[-9, 6], [0, 2], [3, 0]]),
  mulR: toM([[1, -4, 5], [7, 2, 2]]),
  ex1L: toM([[1, 0, 4], [2, 1, 1], [3, 1, 0], [0, 2, 2]]),
  ex1R: toM([[2, 4], [1, 1], [3, 0]]),
  pow: toM([[2, 6], [5, 3]]),
  ex2: { A: toM([[1, 2], [-2, 4]]), B: toM([[3, -4, 5], [2, 1, 0]]), C: toM([[3, 1], [4, 0], [1, 6]]) },
  ps5: {
    A: toM([[1, 2], [3, 4]]),
    B: toM([[5, 3, 2], [6, 2, 1]]),
    C: toM([[-5, 1], [2, -3], [4, 0]]),
    D: toM([[1, 0, 2], [5, 3, -3], [6, -1, 2]]),
  },
  inv2: toM([[4, 7], [2, 6]]),
  inv3: toM([[3, 0, 2], [2, 0, -2], [0, 1, 1]]),
  sysA: toM([[1, 1, 1], [0, 2, 5], [2, 5, -1]]),
  sysB: toM([[6], [-4], [27]]),
  det4: toM([[2, 1, 0, 3], [1, 0, 2, 1], [0, 3, 1, 0], [1, 2, 0, 1]]),
};

// ---------------------------------------------------------------- PDF links
// Opened from the folder: the PDFs sit next to the website folder.
// Online (GitHub Pages): only the reviewer PDF is published, next to index.html.
export const ONLINE = typeof location !== "undefined" && location.protocol.startsWith("http");
export const REVIEWER_PDF = ONLINE ? "sagot-sa-ds2-ni-seb.pdf" : "../sagot sa ds2 ni seb.pdf";
export const SLIDES_PDF = ONLINE ? null : "../3.2. Matrices.pdf";
