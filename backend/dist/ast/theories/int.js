"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z3convert = exports.le = exports.ge = exports.lt = exports.gt = exports.div = exports.mul = exports.sub = exports.neg = exports.add = exports.Int = void 0;
exports.intval = intval;
const ast_1 = require("../ast");
const typecheck_1 = require("../typecheck");
const logic_1 = require("./logic");
exports.Int = (0, ast_1.sort)("Int");
exports.add = (0, ast_1.opfunc)("+", "int.add", (0, typecheck_1.varargOp)(exports.Int, exports.Int), { type: "infix", prec: 100 });
exports.neg = (0, ast_1.opfunc)("-", "int.neg", (0, typecheck_1.basicOp)([exports.Int], exports.Int), { type: "prefix", prec: 500 });
exports.sub = (0, ast_1.opfunc)("-", "int.sub", (0, typecheck_1.varargOp)(exports.Int, exports.Int), { type: "infix", prec: 100 });
exports.mul = (0, ast_1.opfunc)("*", "int.mul", (0, typecheck_1.varargOp)(exports.Int, exports.Int), { type: "infix", prec: 200 });
exports.div = (0, ast_1.opfunc)("/", "int.div", (0, typecheck_1.varargOp)(exports.Int, exports.Int), { type: "infix", prec: 200 });
function intval(n) {
    return { ...(0, ast_1.operator)(n.toString(), n, (0, typecheck_1.basicOp)([], exports.Int), { type: "function" }) };
}
exports.gt = (0, ast_1.opfunc)(">", "int.gt", (0, typecheck_1.basicOp)([exports.Int, exports.Int], logic_1.Bool), { type: "infix", prec: 15 });
exports.lt = (0, ast_1.opfunc)("<", "int.lt", (0, typecheck_1.basicOp)([exports.Int, exports.Int], logic_1.Bool), { type: "infix", prec: 15 });
exports.ge = (0, ast_1.opfunc)(">=", "int.ge", (0, typecheck_1.basicOp)([exports.Int, exports.Int], logic_1.Bool), { type: "infix", prec: 15 });
exports.le = (0, ast_1.opfunc)("<=", "int.le", (0, typecheck_1.basicOp)([exports.Int, exports.Int], logic_1.Bool), { type: "infix", prec: 15 });
exports.z3convert = {
    Int: (ctx, args) => {
        return { sort: ctx.Int.sort(), const: ctx.Int.const };
    },
    "int.add": (ctx, args) => ctx.Sum(...args),
    "int.neg": (ctx, args) => ctx.Neg(...args),
    "int.sub": (ctx, args) => ctx.Sub(...args),
    "int.mul": (ctx, args) => ctx.Product(...args),
    "int.div": (ctx, args) => ctx.Div(...args),
    "int.gt": (ctx, args) => ctx.GT(...args),
    "int.lt": (ctx, args) => ctx.LT(...args),
    "int.ge": (ctx, args) => ctx.GE(...args),
    "int.le": (ctx, args) => ctx.LE(...args),
};
