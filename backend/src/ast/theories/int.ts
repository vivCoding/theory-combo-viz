import { Ast, constant, operator, opfunc, sort } from "../ast"
import { basicOp, varargOp } from "../typecheck"
import { Bool } from "./logic"

import type { Z3Converter } from "../z3convert"

export const Int = sort("Int")

export const add = opfunc("+", "int.add", varargOp(Int, Int), { type: "infix", prec: 100 })
export const neg = opfunc("-", "int.neg", basicOp([Int], Int), { type: "prefix", prec: 500 })
export const sub = opfunc("-", "int.sub", varargOp(Int, Int), { type: "infix", prec: 100 })
export const mul = opfunc("*", "int.mul", varargOp(Int, Int), { type: "infix", prec: 200 })
export const div = opfunc("/", "int.div", varargOp(Int, Int), { type: "infix", prec: 200 })

export function intval(n: number) {
  return { ...operator(n.toString(), n, basicOp([], Int), { type: "function" }) }
}

export const gt = opfunc(">", "int.gt", basicOp([Int, Int], Bool), { type: "infix", prec: 15 })
export const lt = opfunc("<", "int.lt", basicOp([Int, Int], Bool), { type: "infix", prec: 15 })
export const ge = opfunc(">=", "int.ge", basicOp([Int, Int], Bool), { type: "infix", prec: 15 })
export const le = opfunc("<=", "int.le", basicOp([Int, Int], Bool), { type: "infix", prec: 15 })

export const z3convert: Z3Converter = {
  Int: (ctx, args) => {
    return { sort: ctx.Int.sort(), const: ctx.Int.const }
  },
  "int.add": (ctx, args) => (ctx.Sum as any)(...args),
  "int.neg": (ctx, args) => (ctx.Neg as any)(...args),
  "int.sub": (ctx, args) => (ctx.Sub as any)(...args),
  "int.mul": (ctx, args) => (ctx.Product as any)(...args),
  "int.div": (ctx, args) => (ctx.Div as any)(...args),
  "int.gt": (ctx, args) => (ctx.GT as any)(...args),
  "int.lt": (ctx, args) => (ctx.LT as any)(...args),
  "int.ge": (ctx, args) => (ctx.GE as any)(...args),
  "int.le": (ctx, args) => (ctx.LE as any)(...args),
}
