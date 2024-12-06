import { Ast, ConstId } from "../ast/ast"
import { arrayWitness, setWitness } from "../witness/witness"

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
      return value.startsWith("int");
    } else {
      return typeof value === "number"
    }
  },
}

export const setTheory: WitnessedTheory = {
  name: "set",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return value.startsWith("set");
    }
    return false
  },
  witness: setWitness,
}


export const bvTheory: WitnessedTheory = {
  name: "bv",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return value.startsWith("bv");
    }
    return false
  },
  witness: setWitness,
}

export const arrayTheory: WitnessedTheory = {
  name: "array",
  test_ast: (value: any) => {
    if (typeof value === "string") {
      return value.startsWith("array");
    }
    return false
  },
  witness: arrayWitness,
}
