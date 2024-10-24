import { Ast, basicOp, operator, sort, constant, opfunc } from "../ast";


export const Int = sort("Int");

export const add = opfunc("+", basicOp([Int, Int], Int), { type: 'infix', prec: 100 });
export const neg = opfunc("-", basicOp([Int], Int), {type: 'prefix', prec: 500});
export const sub = opfunc("-", basicOp([Int, Int], Int), {type: 'infix', prec: 100});
export const mul = opfunc("*", basicOp([Int, Int], Int), {type: 'infix', prec: 200});
export const div = opfunc("/", basicOp([Int, Int], Int), {type: 'infix', prec: 200});

export function intval(n: number) {
  return {...operator(n.toString(), basicOp([], Int), { type: 'function' }), value: n};
}