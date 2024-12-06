import { Ast, SORT, SortAst, operator, opfunc, sort } from "../ast"
import { basicOp, varargOp } from "../typecheck"

import type { Z3Converter } from "../z3convert"

export const Bool = sort("Bool")
export const _a = SORT.constant("_a")

export const and = opfunc("∧", "and", varargOp(Bool, Bool), { type: "infix", prec: 5 })
export const or = opfunc("∨", "or", varargOp(Bool, Bool), { type: "infix", prec: 3 })
export const implies = opfunc("->", "implies", basicOp([Bool, Bool], Bool), { type: "infix", prec: 1 })
export const not = opfunc("¬", "not", basicOp([Bool], Bool), { type: "prefix", prec: 500 })

export const eq = opfunc("=", "eq", basicOp([_a, _a], Bool, [_a]), { type: "infix", prec: 10 })
export const neq = opfunc("!=", "neq", basicOp([_a, _a], Bool, [_a]), { type: "infix", prec: 10 })

export const z3convert: Z3Converter = {
  Bool: (ctx, args) => {
    return { sort: ctx.Bool.sort(), const: ctx.Bool.const }
  },
  and: (ctx, args) => ctx.And(...args),
  or: (ctx, args) => ctx.Or(...args),
  not: (ctx, args) => ctx.Not(args[0]),
  implies: (ctx, args) => ctx.Implies(args[0], args[1]),
  eq: (ctx, args) => ctx.Eq(args[0], args[1]),
  neq: (ctx, args) => ctx.Not(ctx.Eq(args[0], args[1])),
}
