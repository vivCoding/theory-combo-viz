"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z3convert = exports.subsetof = exports.elemof = exports.single = exports.diff = exports.intersect = exports.empty = exports.union = exports.Set = void 0;
exports.set = set;
const ast_1 = require("../ast");
const typecheck_1 = require("../typecheck");
const z3convert_1 = require("../z3convert");
const logic_1 = require("./logic");
exports.Set = (0, ast_1.sortfunc)("Set", [ast_1.SORT]);
const _a = ast_1.SORT.constant("'a");
exports.union = (0, ast_1.opfunc)("∪", "set.union", (0, typecheck_1.varargOp)((0, exports.Set)(_a), (0, exports.Set)(_a), [_a]), { type: "infix", prec: 80 });
const empty = (sort) => {
    return { ...(0, ast_1.operator)("∅", "set.empty", (0, typecheck_1.basicOp)([], (0, exports.Set)(sort)), { type: "function" }), sort };
};
exports.empty = empty;
exports.intersect = (0, ast_1.opfunc)("∩", "set.intersect", (0, typecheck_1.varargOp)((0, exports.Set)(_a), (0, exports.Set)(_a), [_a]), { type: "infix", prec: 90 });
exports.diff = (0, ast_1.opfunc)("\\", "set.diff", (0, typecheck_1.basicOp)([(0, exports.Set)(_a), (0, exports.Set)(_a)], (0, exports.Set)(_a), [_a]), { type: "infix", prec: 85 });
exports.single = (0, ast_1.opfunc)("{$}", "set.single", (0, typecheck_1.basicOp)([_a], (0, exports.Set)(_a), [_a]), { type: "bracket" });
// export const setof = opfunc("{$}", "set.setof", varargOp([_a], Set(_a), [_a]), { type: "bracket" });
exports.elemof = (0, ast_1.opfunc)("∊", "set.elemof", (0, typecheck_1.basicOp)([_a, (0, exports.Set)(_a)], logic_1.Bool, [_a]), { type: "infix", prec: 20 });
exports.subsetof = (0, ast_1.opfunc)("⊆", "set.subsetof", (0, typecheck_1.basicOp)([(0, exports.Set)(_a), (0, exports.Set)(_a)], logic_1.Bool, [_a]), { type: "infix", prec: 20 });
function set(...args) {
    return (0, exports.union)(...args.map((a) => (0, exports.single)(a)));
}
exports.z3convert = {
    Set: (ctx, args) => {
        return { sort: ctx.Set.sort(args[0].sort), const: (x) => ctx.Set.const(x, args[0].sort) };
    },
    "set.union": (ctx, args) => ctx.SetUnion(...args),
    "set.intersect": (ctx, args) => ctx.SetIntersect(...args),
    "set.empty": (ctx, args, ast) => ctx.EmptySet((0, z3convert_1.convertToZ3Inner)(ast.sort, ctx).sort),
    "set.diff": (ctx, args) => ctx.SetDifference(...args),
    "set.single": (ctx, args, ast) => ctx.Set.val(args, (0, z3convert_1.convertToZ3Inner)(ast.typecheck().args[0], ctx).sort),
    "set.elemof": (ctx, args) => ctx.isMember(...args),
    "set.subsetof": (ctx, args) => ctx.isSubset(...args),
};
