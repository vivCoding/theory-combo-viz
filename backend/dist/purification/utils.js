"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to_clauses = to_clauses;
exports.variables = variables;
const ast_1 = require("../ast/ast");
function to_clauses(ast) {
    const result = [];
    function inner(ast) {
        if (ast.value == "and") {
            for (const arg of ast.args || []) {
                inner(arg);
            }
        }
        else {
            result.push(ast);
        }
    }
    inner(ast);
    return result;
}
function variables(ast) {
    const result = new Map();
    inner(ast);
    function inner(ast) {
        for (const arg of ast.args || []) {
            inner(arg);
        }
        if (ast.value instanceof ast_1.ConstId) {
            result.set(ast.value.name, ast.value);
        }
    }
    return result.values().toArray();
}
