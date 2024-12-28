"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z3convert = exports.neq = exports.eq = exports.not = exports.implies = exports.or = exports.and = exports._a = exports.Bool = void 0;
const ast_1 = require("../ast");
const typecheck_1 = require("../typecheck");
exports.Bool = (0, ast_1.sort)("Bool");
exports._a = ast_1.SORT.constant("_a");
exports.and = (0, ast_1.opfunc)("∧", "and", (0, typecheck_1.varargOp)(exports.Bool, exports.Bool), { type: "infix", prec: 5 });
exports.or = (0, ast_1.opfunc)("∨", "or", (0, typecheck_1.varargOp)(exports.Bool, exports.Bool), { type: "infix", prec: 3 });
exports.implies = (0, ast_1.opfunc)("->", "implies", (0, typecheck_1.basicOp)([exports.Bool, exports.Bool], exports.Bool), { type: "infix", prec: 1 });
exports.not = (0, ast_1.opfunc)("¬", "not", (0, typecheck_1.basicOp)([exports.Bool], exports.Bool), { type: "prefix", prec: 500 });
exports.eq = (0, ast_1.opfunc)("=", "eq", (0, typecheck_1.basicOp)([exports._a, exports._a], exports.Bool, [exports._a]), { type: "infix", prec: 10 });
exports.neq = (0, ast_1.opfunc)("!=", "neq", (0, typecheck_1.basicOp)([exports._a, exports._a], exports.Bool, [exports._a]), { type: "infix", prec: 10 });
exports.z3convert = {
    Bool: (ctx, args) => {
        return { sort: ctx.Bool.sort(), const: ctx.Bool.const };
    },
    and: (ctx, args) => ctx.And(...args),
    or: (ctx, args) => ctx.Or(...args),
    not: (ctx, args) => ctx.Not(args[0]),
    implies: (ctx, args) => ctx.Implies(args[0], args[1]),
    eq: (ctx, args) => ctx.Eq(args[0], args[1]),
    neq: (ctx, args) => ctx.Not(ctx.Eq(args[0], args[1])),
};
