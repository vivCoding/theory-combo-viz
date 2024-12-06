import { init } from "z3-solver"

import { and, eq, neq } from "../ast/theories/logic"
import { convertToZ3, solve } from "../ast/z3convert"
import { purification } from "../purification/purify"
import { variables } from "../purification/utils"
import { baseTheory } from "../theory/theory"

import type { Ast, ConstId } from "../ast/ast"
import type { SolverResult } from "../ast/z3convert"
import type { Theory, WitnessedTheory } from "../theory/theory"
import type { Model } from "z3-solver"

export function set2model1(result: SolverResult): CombinedSolverResult {
  if (result.status === "sat") {
    return { status: "sat", model1: result.model }
  } else {
    return result
  }
}
export function set2model2(result: SolverResult): CombinedSolverResult {
  if (result.status === "sat") {
    return { status: "sat", model2: result.model }
  } else {
    return result
  }
}

export type SolverStep =
  | { type: "purification"; f1: string; f2: string; oldVars: string[]; newVars: string[] }
  | { type: "witness"; f1: string; newVars: string[]; changed: boolean }
  | { type: "arrangement"; arrangement: { var1: string; op: string; var2: string }[]; f1: string; f2: string; result1: string; result2: string }

export type CombinedSolverResult =
  | { status: "sat"; model1?: Model; model2?: Model; steps?: SolverStep[] }
  | { status: "unsat"; steps?: SolverStep[] }
  | { status: "unknown"; steps?: SolverStep[] }

function findWordsStartingWithP(inputString: string) {
  // Use a regular expression to match words starting with '__p'
  const regex = /\b__p\w*\b/g
  // Match all words in the string that match the pattern
  const matches = inputString.match(regex)

  // Return the array of matched words, or an empty array if no matches are found
  return (matches as string[]) || []
}

function findWordsStartingWithE(inputString: string) {
  // Use a regular expression to match words starting with '__p'
  const regex = /\b__e\w*\b/g
  // Match all words in the string that match the pattern
  const matches = inputString.match(regex)

  // Return the array of matched words, or an empty array if no matches are found
  return (matches as string[]) || []
}

function findWordsNotStartingWithP(inputString: string) {
  // Regular expression to match words (letters and numbers, no isolated numbers)
  const regex = /\b[A-Za-z][A-Za-z0-9]*\b/g

  // Find all matches in the string
  const words = inputString.match(regex) || []

  // Filter out words that start with '__p'
  const result = words.filter((word) => !word.startsWith("__p"))

  return result
}

export function combine(theory1: WitnessedTheory, theory2: Theory) {
  return async function (formula: Ast): Promise<CombinedSolverResult> {
    const steps: SolverStep[] = []
    // eslint-disable-next-line prefer-const
    let [_, formula1, formula2] = purification([baseTheory, theory1, theory2], formula)
    if (formula1 === null) {
      if (formula2 !== null) {
        return set2model2(await solve(formula2))
      } else {
        return { status: "unknown", steps }
      }
    }
    if (formula2 === null) {
      if (formula1 !== null) {
        return set2model1(await solve(formula1))
      } else {
        return { status: "unknown", steps }
      }
    }

    const { Context } = await init()
    const ctx = Context("main")

    console.log(`purification: ${formula1?.fmt()}, ${formula2?.fmt()}`)
    const oldVars = [...new Set(findWordsNotStartingWithP(formula1.fmt()).concat(findWordsNotStartingWithP(formula2.fmt())))].sort()
    const newVars = [...new Set(findWordsStartingWithP(formula1.fmt()).concat(findWordsStartingWithP(formula2.fmt())))].sort()
    steps.push({
      type: "purification",
      f1: formula1.fmt(),
      f2: formula2.fmt(),
      oldVars,
      newVars,
    })
    const oldF1 = formula1.fmt()
    formula1 = theory1.witness(formula1).ast

    console.log(`finite witness: ${formula1?.fmt()}`)
    steps.push({
      type: "witness",
      f1: formula1.fmt(),
      changed: formula1.fmt() !== oldF1,
      newVars,
    })

    const vars = variables(formula1)
    const map = new Map<string, ConstId[]>()
    for (const v of vars) {
      if (map.has(v.sort.fmt())) {
        map.get(v.sort.fmt())!.push(v)
      } else {
        map.set(v.sort.fmt(), [v])
      }
    }
    for (const eqclass of generate_classes_all_sorts(Array.from(map.values()))) {
      // console.log(eqclass.flat().map((x) => x.map((y) => y.name).join("=")).join(" "))
      const eqneqs = eqclass.map((x) => eqclasses2eqneqs(x)).flat()
      // console.log(eqneqs.map((x) => x.fmt()).join(", "))
      const ast1 = and(formula1, ...eqneqs)
      const ast2 = and(formula2, ...eqneqs)

      const result1 = await solve(ast1)
      const result2 = await solve(ast2)
      const arrangement = eqneqs.map((x) => {
        const [var1, op, var2] = x.fmt().split(" ")
        return { var1, op, var2 }
      })
      steps.push({
        type: "arrangement",
        arrangement,
        f1: formula1.fmt() + " ∧ ARR",
        f2: formula2.fmt() + " ∧ ARR",
        result1: result1.status,
        result2: result2.status,
      })
      if (result1.status === "sat" && result2.status === "sat") {
        return { status: "sat", model1: result1.model, model2: result2.model, steps }
      } else if (result1.status === "unknown" || result2.status === "unknown") {
        return { status: "unknown", steps }
      }
    }
    return { status: "unsat", steps }
  }
}

export function* generate_classes_all_sorts<T>(vars: T[][]): Generator<T[][][], undefined, undefined> {
  if (vars.length == 0) {
    yield []
    return
  }
  const [vs, ...rest] = vars
  for (const eqclasses of generate_eqclasses(vs)) {
    for (const eqneqs of generate_classes_all_sorts(rest)) {
      yield [eqclasses, ...eqneqs]
    }
  }
}

export function* generate_eqneqs(vars: ConstId[]): Generator<Ast[], undefined, undefined> {
  for (const eqclasses of generate_eqclasses(vars)) {
    yield eqclasses2eqneqs(eqclasses)
  }
}

export function eqclass2eqs(eqclass: ConstId[]): Ast[] {
  return [...Array(eqclass.length - 1).keys()].map((i) => eq(eqclass[i].as_ast(), eqclass[i + 1].as_ast()))
}
export function eqclasses2eqneqs(eqclasses: ConstId[][]): Ast[] {
  const neqs = []
  for (let i = 0; i < eqclasses.length; i++) {
    for (let j = i + 1; j < eqclasses.length; j++) {
      neqs.push(neq(eqclasses[i][0].as_ast(), eqclasses[j][0].as_ast()))
    }
  }
  return [...eqclasses.map(eqclass2eqs), neqs].flat()
}

export function* generate_eqclasses<T>(vars: T[]): Generator<T[][], undefined, undefined> {
  if (vars.length > 0) {
    const [v, ...tail] = vars
    for (const { selected, rest } of allsplits(tail)) {
      for (const eqs of generate_eqclasses(rest)) {
        yield [[v, ...selected], ...eqs]
      }
    }
  } else {
    yield []
  }
  return undefined
}

function split<T>(array: T[], i: number): { selected: T[]; rest: T[] } {
  const selected = []
  const rest = []
  for (let j = 0; j < array.length; j++) {
    if ((i & (1 << j)) > 0) {
      selected.push(array[j])
    } else {
      rest.push(array[j])
    }
  }
  return { selected, rest }
}

export function* allsplits<T>(array: T[]): Generator<{
  selected: T[]
  rest: T[]
}> {
  for (let i = 0; i < 1 << array.length; i++) {
    yield split(array, i)
  }
}
