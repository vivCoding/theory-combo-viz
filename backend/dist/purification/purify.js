"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purifyAst = purifyAst;
exports.purificationClauses = purificationClauses;
exports.purification = purification;
const utils_1 = require("./utils");
const ast_1 = require("../ast/ast");
const logic_1 = require("../ast/theories/logic");
const theory_1 = require("../theory/theory");
function get_theory_single(theories, value) {
    const result = theories.find((t) => t.test_ast(value));
    if (!result) {
        throw new Error(`No theory found for ${value}`);
    }
    return result;
}
function get_theory_rec(theories, ast) {
    const theory = get_theory_single(theories, ast.value);
    if (theory != theory_1.baseTheory) {
        return theory;
    }
    for (const arg of ast.args || []) {
        const th = get_theory_rec(theories, arg);
        if (th != theory_1.baseTheory) {
            return th;
        }
    }
    return theory_1.baseTheory;
}
function purifyAstInner(theory, ast, result) {
    if (theory.test_ast(ast.value) || theory_1.baseTheory.test_ast(ast.value)) {
        ast.args = ast.args?.map((arg) => purifyAstInner(theory, arg, result));
        return ast;
    }
    else {
        const ty = ast.typecheck();
        if (ty === ast_1.SORT) {
            throw new Error();
        }
        const c = ty.constant("__p$");
        result.push((0, logic_1.eq)(ast, c));
        return c;
    }
}
function purifyAst(theory, ast) {
    const result = [];
    purifyAstInner(theory, ast, result);
    return { purified: ast, rest: result };
}
function purificationInner(theories, ast, result) {
    const theory = get_theory_rec(theories, ast);
    const theory_i = theories.indexOf(theory);
    if (theory_i == -1) {
        throw new Error(`Ast from Unknown Theory: ${ast}`);
    }
    const { purified, rest } = purifyAst(theory, ast);
    result[theory_i].push(purified);
    for (const a of rest) {
        purificationInner(theories, a, result);
    }
}
function purificationClauses(theories, ast) {
    const result = theories.map(() => []);
    for (const a of (0, utils_1.to_clauses)(ast)) {
        purificationInner(theories, a, result);
    }
    return result;
}
function purification(theories, ast) {
    const result = purificationClauses(theories, ast);
    return result.map((x) => (x.length > 0 ? x.reduce((acc, x) => (0, logic_1.and)(acc, x)) : null));
}
