import { Ast, operator, opfunc, SORT, SortAst, sortfunc} from "../ast";
import { basicOp, varargOp } from "../typecheck";
import { convertToZ3Inner, Z3Converter } from "../z3convert";
import { Bool } from "./logic";
import { single, union } from "./set";

export const Arr = sortfunc("Arr", [SORT]);
const _a = SORT.constant("'a");

export const select = opfunc("read", "array.select", basicOp([Arr(_a), _a], _a, [_a]), { type: "function" });
export const store = opfunc("write", "array.store", basicOp([Arr(_a), _a, _a], Arr(_a), [_a]), { type: "function" });
export const K = opfunc("K", "array.K", basicOp([_a], Arr(_a), [_a]), { type: "function" });


export const z3convert: Z3Converter = {
  "Arr": (ctx, args) => {
    return {sort: ctx.Array.sort(args[0].sort, args[0].sort), const: (x: any) => ctx.Array.const(x, args[0].sort, args[0].sort)};
  },
  "array.select" : (ctx, args) => (ctx.Select as any)(...args),
  "array.store" : (ctx, args) => (ctx.Store as any)(...args),
  "array.K" : (ctx, args) => {
    if('sort' !in args[0]) { throw new Error(`array.K expecting an expressions but it gives ${args[0].sexpr()}: ${args[0].fmt()}`); }
    return ctx.Array.K(args[0].sort, args[0]);
  },
};