"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EQ = EQ;
exports.UNIFYL = UNIFYL;
exports.UNIFY = UNIFY;
exports.REPLACE = REPLACE;
exports.freeconstants_map = freeconstants_map;
exports.basicOp = basicOp;
exports.varargOp = varargOp;
const ast_1 = require("./ast");
// Function to compare two objects, if they have an equals method, use it, otherwise use the == operator
function EQ(a, b) {
    if (a.equals && b.equals) {
        return a.equals(b);
    }
    else {
        return a === b;
    }
}
// Function to unify two ASTs
function UNIFYL(a, b, constants) {
    console.log(a.fmt(), b.fmt(), b.value instanceof ast_1.ConstId, constants.get(b.value), constants);
    const r = UNIFY(a, b, constants);
    console.log(r);
    return r;
}
function UNIFY(a, b, constants) {
    if (a.value instanceof ast_1.ConstId && constants.get(a.value)) {
        if (constants.get(a.value) === "free") {
            constants.set(a.value, b);
            return true;
        }
        return UNIFY(constants.get(a.value), b, constants);
    }
    if (b.value instanceof ast_1.ConstId && constants.get(b.value)) {
        return UNIFY(b, a, constants);
    }
    if (EQ(a.value, b.value)) {
        if (a.args && b.args && a.args.length == b.args.length) {
            return a.args.every((a, i) => UNIFY(a, b.args[i], constants));
        }
        else {
            return !a.args && !b.args;
        }
    }
    return false;
}
// Replace Ast with variable map.
function REPLACE(a, constants) {
    if (a.value instanceof ast_1.ConstId && constants.get(a.value)) {
        if (constants.get(a.value) === "free") {
            throw new Error("unreplaced constant");
        }
        return constants.get(a.value);
    }
    if (a.args) {
        return { ...a, args: a.args.map((a) => REPLACE(a, constants)) };
    }
    return a;
}
function freeconstants_map(freeconstants = []) {
    const constants = new Map();
    for (const free of freeconstants) {
        constants.set(free.value, "free");
    }
    return constants;
}
function basicOp(argtypes, rettype, freeconstants = []) {
    return (opname, args) => {
        if (args.length != argtypes.length) {
            throw new Error(`wrong number of arguments for ${opname}`);
        }
        const constants = freeconstants_map(freeconstants);
        for (let i = 0; i < args.length; i++) {
            if (!UNIFY(args[i].typecheck(), argtypes[i], constants)) {
                throw new Error("wrong type of argument " + i + ` for ${opname} : ${args[i].typecheck().fmt()}`);
            }
        }
        return REPLACE(rettype, constants);
    };
}
function varargOp(argtype, rettype, freeconstants = []) {
    return (opname, args) => {
        const constants = freeconstants_map(freeconstants);
        for (let i = 0; i < args.length; i++) {
            if (!UNIFY(args[i].typecheck(), argtype, constants)) {
                throw new Error("wrong type of argument " + i + ` for ${opname} : ${args[i].typecheck().fmt()}`);
            }
        }
        return REPLACE(rettype, constants);
    };
}
