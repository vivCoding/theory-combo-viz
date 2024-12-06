import { Ast, operator, sort, constant, opfunc, sortfunc, SortAst } from "../ast";
import { basicOp, varargOp } from "../typecheck";
import { Z3Converter } from "../z3convert";
import { Int, intval } from "./int";
import { Bool } from "./logic";


export const BitVec = sortfunc("BitVec", [Int]);
export const _a = Int.constant("_a");

export const bvadd = opfunc("+", "bv.add", varargOp(BitVec(_a), BitVec(_a), [_a]), { type: 'infix', prec: 100 });
export const bvneg = opfunc("-", "bv.neg", basicOp([BitVec(_a)], BitVec(_a), [_a]), {type: 'prefix', prec: 500});
export const bvsub = opfunc("-", "bv.sub", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 100});
export const bvmul = opfunc("*", "bv.mul", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 200});
export const bvudiv = opfunc("/u", "bv.udiv", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 200});
export const bvsdiv = opfunc("/s", "bv.sdiv", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 200});

export const bvor = opfunc("|", "bv.or", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 80});
export const bvxor = opfunc("^", "bv.xor", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 80});
export const bvand = opfunc("&", "bv.and", varargOp(BitVec(_a), BitVec(_a), [_a]), {type: 'infix', prec: 90});
export const bvnot = opfunc("~", "bv.not", basicOp([BitVec(_a)], BitVec(_a), [_a]), {type: 'infix', prec: 500});
export const bvshl = opfunc("<<", "bv.shl", basicOp([BitVec(_a), BitVec(_a)], BitVec(_a), [_a]), {type: 'infix', prec: 200});
export const bvldiv = opfunc(">>l", "bv.lshr", basicOp([BitVec(_a), BitVec(_a)], BitVec(_a), [_a]), {type: 'infix', prec: 200});
export const bvadiv = opfunc(">>a", "bv.ashr", basicOp([BitVec(_a), BitVec(_a)], BitVec(_a), [_a]), {type: 'infix', prec: 200});

export class BitVecVal {
  constructor(public val: number, public bv_size: number) {}
}
export function bvval(num: number, bv_size: number) {
  return {...operator(num.toString(), new BitVecVal(num, bv_size), basicOp([], BitVec(intval(bv_size))), { type: 'function' })};
}

export const bvugt = opfunc(">u", "bv.ugt", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvsgt = opfunc(">s", "bv.sgt", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvult = opfunc("<u", "bv.ult", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvslt = opfunc("<s", "bv.slt", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvuge = opfunc(">=u", "bv.uge", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvsge = opfunc(">=s", "bv.sge", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvule = opfunc("<=u", "bv.ule", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});
export const bvsle = opfunc("<=s", "bv.sle", basicOp([BitVec(_a), BitVec(_a)], Bool, [_a]), {type: 'infix', prec: 15});

export const z3convert: Z3Converter = {
  "BitVec": (ctx, args, ast) => {
    if(typeof ast.args![0].value != 'number') { throw new Error(`BitVec must has a constant size: ${ast.fmt()}`); }
    return {sort: ctx.BitVec.sort(ast.args![0].value), const: (x: string) => ctx.BitVec.const(x, ast.args![0].value)};
  },
  "bv.add": (ctx, args) => (ctx.Sum as any)(...args),
  "bv.neg": (ctx, args) => (ctx.Neg as any)(...args),
  "bv.sub": (ctx, args) => (ctx.Sub as any)(...args),
  "bv.mul": (ctx, args) => (ctx.Product as any)(...args),
  "bv.udiv": (ctx, args) => (ctx.BUDiv as any)(...args),
  "bv.sdiv": (ctx, args) => (ctx.Div as any)(...args),
  "bv.or": (ctx, args) => args[0].or(args[1]),
  "bv.xor": (ctx, args) => args[0].xor(args[1]),
  "bv.and": (ctx, args) => args[0].and(args[1]),
  "bv.not": (ctx, args) => args[0].not(),
  "bv.shl": (ctx, args) => args[0].shl(args[1]),
  "bv.lshr": (ctx, args) => args[0].lshr(args[1]),
  "bv.ashr": (ctx, args) => args[0].shr(args[1]),
  "bv.ugt": (ctx, args) => args[0].ugt(args[1]),
  "bv.sgt": (ctx, args) => args[0].sgt(args[1]),
  "bv.ult": (ctx, args) => args[0].ult(args[1]),
  "bv.slt": (ctx, args) => args[0].slt(args[1]),
  "bv.uge": (ctx, args) => args[0].uge(args[1]),
  "bv.sge": (ctx, args) => args[0].sge(args[1]),
  "bv.ule": (ctx, args) => args[0].ule(args[1]),
  "bv.sle": (ctx, args) => args[0].sle(args[1]),
}