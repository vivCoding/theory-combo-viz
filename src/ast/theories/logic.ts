import { Ast, basicOp, operator, opfunc, sort } from "../ast";

export const Bool = sort("Bool");

export const and = opfunc("/\\", basicOp([Bool], Bool), { type: 'infix', prec: 50 });
export const or = opfunc("\\/", basicOp([Bool], Bool), { type: 'infix', prec: 60 });
export const not = opfunc("¬", basicOp([Bool], Bool), { type: 'prefix', prec: 500 });

function same_type_bool(opname: string, args: Ast[]) : Ast {
  if(args.length != 2) {
      throw new Error(`wrong number of arguments for ${opname}`);
  }
  if(args[0].typecheck(args[0].args || []) != args[1].typecheck(args[1].args || [])) {
      throw new Error(`wrong type of arguments for ${opname}`);
  }
  return Bool;
}

export const eq = opfunc("=", same_type_bool, { type: 'infix', prec: 10 });
export const neq = opfunc("!=", same_type_bool, { type: 'infix', prec: 10 });
