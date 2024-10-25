import { Ast, basicOp, operator, sort, constant, opfunc, varargOp } from "../ast";


export const Int = sort("Int");

export const add = opfunc("+", "int.add", varargOp(Int, Int), { type: 'infix', prec: 100 });
export const neg = opfunc("-", "int.neg", basicOp([Int], Int), {type: 'prefix', prec: 500});
export const sub = opfunc("-", "int.sub", varargOp(Int, Int), {type: 'infix', prec: 100});
export const mul = opfunc("*", "int.mul", varargOp(Int, Int), {type: 'infix', prec: 200});
export const div = opfunc("/", "int.div", varargOp(Int, Int), {type: 'infix', prec: 200});

export function intval(n: number) {
  return {...operator(n.toString(), n, basicOp([], Int), { type: 'function' })};
}