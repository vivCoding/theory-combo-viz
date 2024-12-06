import z3, { Context, init, Model } from "z3-solver"
import { Ast, ConstId, SortId } from "./ast"
import _, { constant } from "lodash"
import * as int from "./theories/int"
import * as logic from "./theories/logic"
import * as set from "./theories/set"
import * as array from "./theories/array"
import * as bitvec from "./theories/bitvec"
import { BitVecVal } from "./theories/bitvec"

export type Z3Converter = {
  [key: string]: (ctx: Context, args: any[], ast: Ast) => any
}

export var z3converter: Z3Converter = {}
export var CTX: Context = null as any

export function convertToZ3Inner(ast: Ast, ctx: Context): any {
  const args = ast.args?.map((x) => convertToZ3Inner(x, ctx)) ?? []
  if (ast.value instanceof ConstId) {
    return (convertToZ3Inner(ast.value.sort, ctx) as any).const(ast.value.name)
  } else if (ast.value instanceof SortId) {
    try {
      return z3converter[ast.value.name](ctx, args, ast)
    } catch (e: any) {
      throw new Error(`Z3 convertion error at ${ast.fmt()}: ${e}\n ${e.stack}`)
    }
  } else if (typeof ast.value == "string") {
    try {
      return z3converter[ast.value](ctx, args, ast)
    } catch (e: any) {
      throw new Error(`Z3 convertion error at ${ast.fmt()}: ${e}\n ${e.stack}`)
    }
  } else if (typeof ast.value == "number") {
    return ctx.Int.sort().cast(ast.value);
  } else if (ast.value instanceof BitVecVal) {
    return ctx.BitVec.sort(ast.value.bv_size).cast(ast.value.val);
  } else {
    throw new Error(`Z3 convertion error at ${ast.fmt()}: unknown value ${ast.value}`)
  }
}

export function convertToZ3(ast: Ast, ctx: Context): z3.Ast | { sort: z3.Sort; const: (x: string) => z3.Ast } {
  if (_.isEmpty(z3converter)) {
    z3converter = {
      ...int.z3convert,
      ...logic.z3convert,
      ...set.z3convert,
      ...array.z3convert,
      ...bitvec.z3convert,
    }
  }
  const result = convertToZ3Inner(ast, ctx)
  return result
}

export type SolverResult = { status: "sat"; model: Model } | { status: "unsat" } | { status: "unknown" }

export async function solve(ast: Ast): Promise<SolverResult> {
  const { Context } = await init()
  const ctx = Context("main")
  const solver = new ctx.Solver()
  const z3ast = convertToZ3(ast, ctx) as z3.Bool
  solver.add(z3ast)
  const status = await solver.check()
  if (status == "sat") {
    return { status: "sat", model: solver.model() }
  } else if (status == "unsat") {
    return { status: "unsat" }
  } else {
    return { status: "unknown" }
  }
}

export async function solveZ3(ctx: Context, ast: z3.Bool) {
  const solver = new ctx.Solver()
  solver.add(ast)
  const status = await solver.check()
  console.log(status)
  if (status == "sat") {
    return { status: "sat", model: solver.model() }
  } else if (status == "unsat") {
    return { status: "unsat" }
  } else {
    return { status: "unknown" }
  }
}
