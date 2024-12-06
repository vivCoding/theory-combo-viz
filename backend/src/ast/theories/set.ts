import { SORT, operator, opfunc, sortfunc } from "../ast"
import { basicOp, varargOp } from "../typecheck"
import { convertToZ3Inner } from "../z3convert"
import { Bool } from "./logic"

import type { Ast, SortAst } from "../ast"
import type { Z3Converter } from "../z3convert"

export const Set = sortfunc("Set", [SORT])
const _a = SORT.constant("'a")

export const union = opfunc("∪", "set.union", varargOp(Set(_a), Set(_a), [_a]), { type: "infix", prec: 80 })
export const empty = (sort: SortAst) => {
  return { ...operator("∅", "set.empty", basicOp([], Set(sort)), { type: "function" }), sort }
}
export const intersect = opfunc("∩", "set.intersect", varargOp(Set(_a), Set(_a), [_a]), { type: "infix", prec: 90 })
export const diff = opfunc("\\", "set.diff", basicOp([Set(_a), Set(_a)], Set(_a), [_a]), { type: "infix", prec: 85 })
export const single = opfunc("{$}", "set.single", basicOp([_a], Set(_a), [_a]), { type: "bracket" })
// export const setof = opfunc("{$}", "set.setof", varargOp([_a], Set(_a), [_a]), { type: "bracket" });
export const elemof = opfunc("∊", "set.elemof", basicOp([_a, Set(_a)], Bool, [_a]), { type: "infix", prec: 20 })
export const subsetof = opfunc("⊆", "set.subsetof", basicOp([Set(_a), Set(_a)], Bool, [_a]), { type: "infix", prec: 20 })

export function set(...args: Ast[]) {
  return union(...args.map((a) => single(a)))
}

export const z3convert: Z3Converter = {
  Set: (ctx, args) => {
    return { sort: ctx.Set.sort(args[0].sort), const: (x: any) => ctx.Set.const(x, args[0].sort) }
  },
  "set.union": (ctx, args) => (ctx.SetUnion as any)(...args),
  "set.intersect": (ctx, args) => (ctx.SetIntersect as any)(...args),
  "set.empty": (ctx, args, ast) => ctx.EmptySet(convertToZ3Inner((ast as any).sort, ctx).sort),
  "set.diff": (ctx, args) => (ctx.SetDifference as any)(...args),
  "set.single": (ctx, args, ast) => ctx.Set.val(args, convertToZ3Inner((ast.typecheck() as any).args[0], ctx).sort),
  "set.elemof": (ctx, args) => (ctx.isMember as any)(...args),
  "set.subsetof": (ctx, args) => (ctx.isSubset as any)(...args),
}
