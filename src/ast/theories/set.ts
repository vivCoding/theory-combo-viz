import { Ast, basicOp, operator, opfunc, sort, varargOp } from "../ast";

const Set = sort("Set");

export const union = opfunc("|", varargOp(Set, Set), { type: "infix", prec: 80 });
export const empty = union();
export const intersect = opfunc("&", varargOp(Set, Set), { type: "infix", prec: 80 });
export const single = opfunc("{$}", basicOp(['any'], Set), { type: "bracket" });

export function set(...args: Ast[]) {
  return union(...args.map(a => single(a)));
}


