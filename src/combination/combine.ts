import { init, Model } from "z3-solver"
import { Ast, ConstId } from "../ast/ast"
import { and, eq, neq } from "../ast/theories/logic"
import { convertToZ3, solve, SolverResult } from "../ast/z3convert"
import { variables } from "../purification/utils"
import { baseTheory, Theory, WitnessedTheory } from "../theory/theory"
import { purification } from "../purification/purify"

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

export type CombinedSolverResult = { status: "sat"; model1?: Model; model2?: Model } | { status: "unsat" } | { status: "unknown" }

export function init_purificaiton_result(result: (Ast | null)[]) {
  var [base_fomula, formula1, formula2] = result;
  return [
    base_fomula && formula1? and(formula1, base_fomula) : formula1,
    base_fomula && formula2? and(formula2, base_fomula) : formula2,
  ]
}

export function combine(theory1: WitnessedTheory, theory2: Theory) {
  return async function (formula: Ast): Promise<CombinedSolverResult> {
    var [formula1, formula2] = init_purificaiton_result(purification([baseTheory, theory1, theory2], formula))
    if (formula1 === null) {
      if (formula2 !== null) {
        return set2model2(await solve(formula2))
      } else {
        return { status: "unknown" }
      }
    }
    if (formula2 === null) {
      if (formula1 !== null) {
        return set2model1(await solve(formula1))
      } else {
        return { status: "unknown" }
      }
    }

    const { Context } = await init()
    const ctx = Context("main")

    console.log(`purification: ${formula1?.fmt()}, ${formula2?.fmt()}`)
    formula1 = theory1.witness(formula1).ast

    console.log(`finite witness: ${formula1?.fmt()}`)

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
      console.log(eqneqs.map((x) => x.fmt()).join(", "))
      let ast1 = and(formula1, ...eqneqs)
      let ast2 = and(formula2, ...eqneqs)
      const result1 = await solve(ast1)
      const result2 = await solve(ast2)
      if (result1.status === "sat" && result2.status === "sat") {
        console.log(ast1.fmt())
        return { status: "sat", model1: result1.model, model2: result2.model }
      } else if (result1.status === "unknown" || result2.status === "unknown") {
        return { status: "unknown" }
      }
    }
    return { status: "unsat" }
  }
}

export function* generate_classes_all_sorts<T>(vars: T[][]): Generator<T[][][], undefined, undefined> {
  if(vars.length == 0) {
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
  selected: T[]; rest: T[] 
}> {
  for (let i = 0; i < 1 << array.length; i++) {
    yield split(array, i)
  }
}
