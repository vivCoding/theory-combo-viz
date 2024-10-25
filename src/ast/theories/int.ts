import { Ast, operator, sort, constant, opfunc } from "../ast";
import { basicOp, varargOp } from "../typecheck";
import { Bool } from "./logic";


export const Int = sort("Int");

export const add = opfunc("+", "int.add", varargOp(Int, Int), { type: 'infix', prec: 100 });
export const neg = opfunc("-", "int.neg", basicOp([Int], Int), {type: 'prefix', prec: 500});
export const sub = opfunc("-", "int.sub", varargOp(Int, Int), {type: 'infix', prec: 100});
export const mul = opfunc("*", "int.mul", varargOp(Int, Int), {type: 'infix', prec: 200});
export const div = opfunc("/", "int.div", varargOp(Int, Int), {type: 'infix', prec: 200});

export function intval(n: number) {
  return {...operator(n.toString(), n, basicOp([], Int), { type: 'function' })};
}

export const gt = opfunc(">", "int.gt", basicOp([Int, Int], Bool), {type: 'infix', prec: 15});
export const lt = opfunc("<", "int.lt", basicOp([Int, Int], Bool), {type: 'infix', prec: 15});
export const ge = opfunc(">=", "int.ge", basicOp([Int, Int], Bool), {type: 'infix', prec: 15});
export const le = opfunc("<=", "int.le", basicOp([Int, Int], Bool), {type: 'infix', prec: 15});
