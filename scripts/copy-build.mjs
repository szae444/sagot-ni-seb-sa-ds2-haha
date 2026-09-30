// After `vite build`: puts the single-file site where it's needed.
//  1. ../../Sagot ni Seb sa ds2 haha.html  (double-click to open locally)
//  2. docs/index.html                      (served by GitHub Pages)
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const here = (p) => resolve(import.meta.dirname, p);
const built = here("../dist/index.html");

const local = here("../../Sagot ni Seb sa ds2 haha.html");
copyFileSync(built, local);
console.log("Local copy:", local);

mkdirSync(here("../docs"), { recursive: true });
copyFileSync(built, here("../docs/index.html"));
const pdf = here("../../../sagot sa ds2 ni seb.pdf");
if (existsSync(pdf)) copyFileSync(pdf, here("../docs/sagot-sa-ds2-ni-seb.pdf"));
console.log("GitHub Pages copy: docs/index.html");
