"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z3convert = exports.bvsle = exports.bvule = exports.bvsge = exports.bvuge = exports.bvslt = exports.bvult = exports.bvsgt = exports.bvugt = exports.BitVecVal = exports.bvadiv = exports.bvldiv = exports.bvshl = exports.bvnot = exports.bvand = exports.bvxor = exports.bvor = exports.bvsdiv = exports.bvudiv = exports.bvmul = exports.bvsub = exports.bvneg = exports.bvadd = exports._a = exports.BitVec = void 0;
exports.bvval = bvval;
const ast_1 = require("../ast");
const typecheck_1 = require("../typecheck");
const int_1 = require("./int");
const logic_1 = require("./logic");
exports.BitVec = (0, ast_1.sortfunc)("BitVec", [int_1.Int]);
exports._a = int_1.Int.constant("_a");
exports.bvadd = (0, ast_1.opfunc)("+", "bv.add", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 100 });
exports.bvneg = (0, ast_1.opfunc)("-", "bv.neg", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a)], (0, exports.BitVec)(exports._a), [exports._a]), { type: 'prefix', prec: 500 });
exports.bvsub = (0, ast_1.opfunc)("-", "bv.sub", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 100 });
exports.bvmul = (0, ast_1.opfunc)("*", "bv.mul", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
exports.bvudiv = (0, ast_1.opfunc)("/u", "bv.udiv", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
exports.bvsdiv = (0, ast_1.opfunc)("/s", "bv.sdiv", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
exports.bvor = (0, ast_1.opfunc)("|", "bv.or", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 80 });
exports.bvxor = (0, ast_1.opfunc)("^", "bv.xor", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 80 });
exports.bvand = (0, ast_1.opfunc)("&", "bv.and", (0, typecheck_1.varargOp)((0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 90 });
exports.bvnot = (0, ast_1.opfunc)("~", "bv.not", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a)], (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 500 });
exports.bvshl = (0, ast_1.opfunc)("<<", "bv.shl", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
exports.bvldiv = (0, ast_1.opfunc)(">>l", "bv.lshr", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
exports.bvadiv = (0, ast_1.opfunc)(">>a", "bv.ashr", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], (0, exports.BitVec)(exports._a), [exports._a]), { type: 'infix', prec: 200 });
class BitVecVal {
    val;
    bv_size;
    constructor(val, bv_size) {
        this.val = val;
        this.bv_size = bv_size;
    }
}
exports.BitVecVal = BitVecVal;
function bvval(num, bv_size) {
    return { ...(0, ast_1.operator)(num.toString(), new BitVecVal(num, bv_size), (0, typecheck_1.basicOp)([], (0, exports.BitVec)((0, int_1.intval)(bv_size))), { type: 'function' }) };
}
exports.bvugt = (0, ast_1.opfunc)(">u", "bv.ugt", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvsgt = (0, ast_1.opfunc)(">s", "bv.sgt", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvult = (0, ast_1.opfunc)("<u", "bv.ult", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvslt = (0, ast_1.opfunc)("<s", "bv.slt", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvuge = (0, ast_1.opfunc)(">=u", "bv.uge", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvsge = (0, ast_1.opfunc)(">=s", "bv.sge", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvule = (0, ast_1.opfunc)("<=u", "bv.ule", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.bvsle = (0, ast_1.opfunc)("<=s", "bv.sle", (0, typecheck_1.basicOp)([(0, exports.BitVec)(exports._a), (0, exports.BitVec)(exports._a)], logic_1.Bool, [exports._a]), { type: 'infix', prec: 15 });
exports.z3convert = {
    "BitVec": (ctx, args, ast) => {
        if (typeof ast.args[0].value != 'number') {
            throw new Error(`BitVec must has a constant size: ${ast.fmt()}`);
        }
        return { sort: ctx.BitVec.sort(ast.args[0].value), const: (x) => ctx.BitVec.const(x, ast.args[0].value) };
    },
    "bv.add": (ctx, args) => ctx.Sum(...args),
    "bv.neg": (ctx, args) => ctx.Neg(...args),
    "bv.sub": (ctx, args) => ctx.Sub(...args),
    "bv.mul": (ctx, args) => ctx.Product(...args),
    "bv.udiv": (ctx, args) => ctx.BUDiv(...args),
    "bv.sdiv": (ctx, args) => ctx.Div(...args),
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
};
