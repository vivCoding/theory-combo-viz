import { Ast, operator, opfunc, SORT, sortfunc} from "../ast";
import { basicOp, varargOp } from "../typecheck";
import { Bool } from "./logic";

export const Set = sortfunc("Set", [SORT]);
const _a = SORT.constant("'a");

export const union = opfunc("|", "set.union", varargOp(Set(_a), Set(_a), [_a]), { type: "infix", prec: 80 });
export const empty = union();
export const intersect = opfunc("&", "set.intersect", varargOp(Set(_a), Set(_a), [_a]), { type: "infix", prec: 80 });
export const single = opfunc("{$}", "set.single", basicOp([_a], Set(_a), [_a]), { type: "bracket" });
export const elemof = opfunc("∊", "set.elemof", basicOp([_a, Set(_a)], Bool, [_a]), { type: "infix", prec: 20 });

export function set(...args: Ast[]) {
  return union(...args.map(a => single(a)));
}


