import { Ast, SORT, SortAst, operator, opfunc, sort } from "../ast";
import { varargOp, basicOp } from "../typecheck";

export const Bool = sort("Bool");
export const _a = SORT.constant("_a");

export const and = opfunc("/\\", "and", varargOp(Bool, Bool), { type: 'infix', prec: 50 });
export const or = opfunc("\\/", "or", varargOp(Bool, Bool), { type: 'infix', prec: 60 });
export const not = opfunc("¬", "not", basicOp([Bool], Bool), { type: 'prefix', prec: 500 });

export const eq = opfunc("=", "eq", basicOp([_a, _a], Bool, [_a]), { type: 'infix', prec: 10 });
export const neq = opfunc("!=", "neq", basicOp([_a, _a], Bool, [_a]), { type: 'infix', prec: 10 });
