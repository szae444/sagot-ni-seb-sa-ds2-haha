# Sagot ni Seb sa DS2 haha

An interactive reviewer for **DS2 · Topic 3.2: Matrices**. It covers every slide example, Exercise 1 & 2, and all ten items of Problem Set 5, solved step by step.

**Live site:** https://szae444.github.io/sagot-ni-seb-sa-ds2-haha/

## Features
- 12 chapters: definition, scalar multiplication, addition, transpose, multiplication, powers, determinants (2×2, Sarrus, cofactor expansion), inverses (2×2 formula, Gauss-Jordan, adjugate), and solving systems
- Clickable row × column multiplication, with a quiz mode
- Matrix Lab: type any matrix and get every step for 10 operations
- Endless practice problems with instant checking and streaks
- Flashcards, a cheat sheet, light/dark mode, Ctrl+K search, and progress tracking

## Stack
React 19 · TypeScript · Tailwind CSS v4 · Motion · Vite. Math uses exact fractions. The build is inlined into a single HTML file (`vite-plugin-singlefile`), so it also works offline.

## Develop
```bash
npm install
npm run dev     # local dev server
npm run build   # type-check + build → docs/index.html (GitHub Pages)
```
