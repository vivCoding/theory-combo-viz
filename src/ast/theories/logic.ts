import { Ast, eq as eqq, basicOp, operator, opfunc, sort, varargOp } from "../ast";

export const Bool = sort("Bool");

export const and = opfunc("/\\", "and", varargOp(Bool, Bool), { type: 'infix', prec: 50 });
export const or = opfunc("\\/", "or", varargOp(Bool, Bool), { type: 'infix', prec: 60 });
export const not = opfunc("¬", "not", basicOp([Bool], Bool), { type: 'prefix', prec: 500 });

function same_type_bool(opname: string, args: Ast[]) : Ast {
  if(args.length != 2) {
      throw new Error(`wrong number of arguments for ${opname}`);
  }
  if(!eqq(args[0].typecheck(), args[1].typecheck())) {
      throw new Error(`wrong type of arguments for ${opname}`);
  }
  return Bool;
}

export const eq = opfunc("=", "eq", same_type_bool, { type: 'infix', prec: 10 });
export const neq = opfunc("!=", "neq", same_type_bool, { type: 'infix', prec: 10 });
