"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayTheory = exports.bvTheory = exports.setTheory = exports.intTheory = exports.baseTheory = void 0;
const ast_1 = require("../ast/ast");
const witness_1 = require("../witness/witness");
exports.baseTheory = {
    name: "base",
    test_ast: (value) => {
        if (typeof value === "string") {
            return ["and", "or", "not", "eq", "neq", "implies"].includes(value);
        }
        else {
            return value instanceof ast_1.ConstId;
        }
    },
};
exports.intTheory = {
    name: "int",
    test_ast: (value) => {
        if (typeof value === "string") {
            return value.startsWith("int");
        }
        else {
            return typeof value === "number";
        }
    },
};
exports.setTheory = {
    name: "set",
    test_ast: (value) => {
        if (typeof value === "string") {
            return value.startsWith("set");
        }
        return false;
    },
    witness: witness_1.setWitness,
};
exports.bvTheory = {
    name: "bv",
    test_ast: (value) => {
        if (typeof value === "string") {
            return value.startsWith("bv");
        }
        return false;
    },
    witness: witness_1.setWitness,
};
exports.arrayTheory = {
    name: "array",
    test_ast: (value) => {
        if (typeof value === "string") {
            return value.startsWith("array");
        }
        return false;
    },
    witness: witness_1.arrayWitness,
};
