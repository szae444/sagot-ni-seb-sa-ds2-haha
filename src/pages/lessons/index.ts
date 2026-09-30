import type { ComponentType } from "react";
import { AddLesson, MatrixLesson, MultiplyLesson, PowerLesson, ScalarLesson, TransposeLesson } from "./Basics";
import { CheatSheet, DeterminantLesson, InverseLesson, SystemsLesson } from "./Advanced";
import { Exercise2, ProblemSet5 } from "./Solved";

export const LESSONS: Record<string, ComponentType> = {
  matrix: MatrixLesson,
  scalar: ScalarLesson,
  add: AddLesson,
  transpose: TransposeLesson,
  multiply: MultiplyLesson,
  power: PowerLesson,
  "exercise-2": Exercise2,
  "problem-set-5": ProblemSet5,
  determinant: DeterminantLesson,
  inverse: InverseLesson,
  systems: SystemsLesson,
  cheatsheet: CheatSheet,
};
