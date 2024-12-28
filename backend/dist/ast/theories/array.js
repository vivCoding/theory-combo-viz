"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z3convert = exports.K = exports.store = exports.select = exports.Arr = void 0;
const ast_1 = require("../ast");
const typecheck_1 = require("../typecheck");
exports.Arr = (0, ast_1.sortfunc)("Arr", [ast_1.SORT]);
const _a = ast_1.SORT.constant("'a");
exports.select = (0, ast_1.opfunc)("read", "array.select", (0, typecheck_1.basicOp)([(0, exports.Arr)(_a), _a], _a, [_a]), { type: "function" });
exports.store = (0, ast_1.opfunc)("write", "array.store", (0, typecheck_1.basicOp)([(0, exports.Arr)(_a), _a, _a], (0, exports.Arr)(_a), [_a]), { type: "function" });
exports.K = (0, ast_1.opfunc)("K", "array.K", (0, typecheck_1.basicOp)([_a], (0, exports.Arr)(_a), [_a]), { type: "function" });
exports.z3convert = {
    "Arr": (ctx, args) => {
        return { sort: ctx.Array.sort(args[0].sort, args[0].sort), const: (x) => ctx.Array.const(x, args[0].sort, args[0].sort) };
    },
    "array.select": (ctx, args) => ctx.Select(...args),
    "array.store": (ctx, args) => ctx.Store(...args),
    "array.K": (ctx, args) => {
        if ('sort' in args[0]) {
            throw new Error(`array.K expecting an expressions but it gives ${args[0].sexpr()}: ${args[0].fmt()}`);
        }
        return ctx.Array.K(args[0].sort, args[0]);
    },
};
