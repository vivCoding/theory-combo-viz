"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWitness = setWitness;
exports.arrayWitness = arrayWitness;
const lodash_1 = __importDefault(require("lodash"));
const array_1 = require("../ast/theories/array");
const logic_1 = require("../ast/theories/logic");
const ast_1 = require("../ast/ast");
const set_1 = require("../ast/theories/set");
const typecheck_1 = require("../ast/typecheck");
function setWitnessInner(ast, vars, isnegation = false) {
    ast = lodash_1.default.cloneDeep(ast);
    if (ast.value === "not") {
        ast.args = [setWitnessInner(ast.args[0], vars, !isnegation)];
    }
    else if (ast.value === "implies") {
        ast.args = [setWitnessInner(ast.args[0], vars, !isnegation), setWitnessInner(ast.args[1], vars, isnegation)];
    }
    else {
        ast.args = ast.args?.map((x) => setWitnessInner(x, vars, isnegation));
    }
    if ((isnegation && ast.value === "eq") || (!isnegation && ast.value === "neq")) {
        const _a = ast_1.SORT.constant("'a");
        const constants = (0, typecheck_1.freeconstants_map)([_a]);
        if ((0, typecheck_1.UNIFY)(ast.args[0].typecheck(), (0, set_1.Set)(_a), constants)) {
            const ty = (0, typecheck_1.REPLACE)(_a, constants);
            const c_e = ty.constant('__e$');
            vars.push(c_e.value);
            const result = (0, set_1.elemof)(c_e, (0, set_1.union)((0, set_1.diff)(ast.args[0], ast.args[1]), (0, set_1.diff)(ast.args[1], ast.args[0])));
            return isnegation ? (0, logic_1.not)(result) : result;
        }
    }
    return ast;
}
function setWitness(ast) {
    const vars = [];
    return {
        ast: setWitnessInner(ast, vars),
        vars,
    };
}
function arrayWitnessInner(ast, vars, isnegation = false) {
    ast = lodash_1.default.cloneDeep(ast);
    if (ast.value === "not") {
        ast.args = [setWitnessInner(ast.args[0], vars, !isnegation)];
    }
    else if (ast.value === "implies") {
        ast.args = [setWitnessInner(ast.args[0], vars, !isnegation), setWitnessInner(ast.args[1], vars, isnegation)];
    }
    else {
        ast.args = ast.args?.map((x) => setWitnessInner(x, vars, isnegation));
    }
    if (isnegation && ast.value === "eq" || !isnegation && ast.value === "neq") {
        const _a = ast_1.SORT.constant("'a");
        const constants = (0, typecheck_1.freeconstants_map)([_a]);
        if ((0, typecheck_1.UNIFY)(ast.args[0].typecheck(), (0, array_1.Arr)(_a), constants)) {
            const ty = (0, typecheck_1.REPLACE)(_a, constants);
            const c_i = ty.constant('__i$');
            vars.push(c_i.value);
            const result = (isnegation ? logic_1.eq : logic_1.neq)((0, array_1.select)(ast.args[0], c_i), (0, array_1.select)(ast.args[0], c_i));
            return result;
        }
    }
    return ast;
}
function arrayWitness(ast) {
    var vars = Array();
    return {
        ast: setWitnessInner(ast, vars),
        vars
    };
}
