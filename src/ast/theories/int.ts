import { Ast, basicOp, operator, sort, constant, opfunc, varargOp } from "../ast";


export const Int = sort("Int");

export const add = opfunc("+", varargOp(Int, Int), { type: 'infix', prec: 100 });
export const neg = opfunc("-", basicOp([Int], Int), {type: 'prefix', prec: 500});
export const sub = opfunc("-", varargOp(Int, Int), {type: 'infix', prec: 100});
export const mul = opfunc("*", varargOp(Int, Int), {type: 'infix', prec: 200});
export const div = opfunc("/", varargOp(Int, Int), {type: 'infix', prec: 200});

export function intval(n: number) {
  return {...operator(n.toString(), basicOp([], Int), { type: 'function' }), value: n};
}