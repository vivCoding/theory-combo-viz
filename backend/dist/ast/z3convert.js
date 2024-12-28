"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTX = exports.z3converter = void 0;
exports.convertToZ3Inner = convertToZ3Inner;
exports.convertToZ3 = convertToZ3;
exports.solve = solve;
exports.solveZ3 = solveZ3;
const lodash_1 = __importDefault(require("lodash"));
const z3_solver_1 = require("z3-solver");
const ast_1 = require("./ast");
const int = __importStar(require("./theories/int"));
const logic = __importStar(require("./theories/logic"));
const set = __importStar(require("./theories/set"));
const array = __importStar(require("./theories/array"));
const bitvec = __importStar(require("./theories/bitvec"));
const bitvec_1 = require("./theories/bitvec");
exports.z3converter = {};
exports.CTX = null;
function convertToZ3Inner(ast, ctx) {
    const args = ast.args?.map((x) => convertToZ3Inner(x, ctx)) ?? [];
    if (ast.value instanceof ast_1.ConstId) {
        return convertToZ3Inner(ast.value.sort, ctx).const(ast.value.name);
    }
    else if (ast.value instanceof ast_1.SortId) {
        try {
            return exports.z3converter[ast.value.name](ctx, args, ast);
        }
        catch (e) {
            throw new Error(`Z3 convertion error at ${ast.fmt()}: ${e}\n ${e.stack}`);
        }
    }
    else if (typeof ast.value == "string") {
        try {
            return exports.z3converter[ast.value](ctx, args, ast);
        }
        catch (e) {
            throw new Error(`Z3 convertion error at ${ast.fmt()}: ${e}\n ${e.stack}`);
        }
    }
    else if (typeof ast.value == "number") {
        return ctx.Int.sort().cast(ast.value);
    }
    else if (ast.value instanceof bitvec_1.BitVecVal) {
        return ctx.BitVec.sort(ast.value.bv_size).cast(ast.value.val);
    }
    else {
        throw new Error(`Z3 convertion error at ${ast.fmt()}: unknown value ${ast.value}`);
    }
}
function convertToZ3(ast, ctx) {
    if (lodash_1.default.isEmpty(exports.z3converter)) {
        exports.z3converter = {
            ...int.z3convert,
            ...logic.z3convert,
            ...set.z3convert,
            ...array.z3convert,
            ...bitvec.z3convert,
        };
    }
    const result = convertToZ3Inner(ast, ctx);
    return result;
}
async function solve(ast) {
    const { Context } = await (0, z3_solver_1.init)();
    const ctx = Context("main");
    const solver = new ctx.Solver();
    const z3ast = convertToZ3(ast, ctx);
    solver.add(z3ast);
    const status = await solver.check();
    if (status == "sat") {
        return { status: "sat", model: solver.model() };
    }
    else if (status == "unsat") {
        return { status: "unsat" };
    }
    else {
        return { status: "unknown" };
    }
}
async function solveZ3(ctx, ast) {
    const solver = new ctx.Solver();
    solver.add(ast);
    const status = await solver.check();
    console.log(status);
    if (status == "sat") {
        return { status: "sat", model: solver.model() };
    }
    else if (status == "unsat") {
        return { status: "unsat" };
    }
    else {
        return { status: "unknown" };
    }
}
