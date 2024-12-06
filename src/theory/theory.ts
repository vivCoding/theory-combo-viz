import { ConstId } from "../ast/ast"
import { setWitness } from "../witness/witness"

import type { Ast } from "../ast/ast"

export type Theory = {
  name: string
  test_ast: (value: any) => boolean
}
export type WitnessedTheory = Theory & {
  witness(ast: Ast): { ast: Ast; vars: ConstId[] }
  // solve: (ast: Ast) => {status: 'sat' | 'unsat' | 'unknown', model?: any},
}

export const baseTheory: Theory = {
  name: "base",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return ["and", "or", "not", "eq", "neq", "implies"].includes(value)
    } else {
      return value instanceof ConstId
    }
  },
}

export const intTheory: Theory = {
  name: "int",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return ["int.add", "int.neg", "int.sub", "int.mul", "int.div", "int.gt", "int.lt", "int.ge", "int.le"].includes(value)
    } else {
      return typeof value === "number"
    }
  },
}

export const setTheory: WitnessedTheory = {
  name: "set",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return ["set.union", "set.intersect", "set.single", "set.elemof", "set.diff", "set.empty", "set.subsetof"].includes(value)
    }
    return false
  },
  witness: setWitness,
}
