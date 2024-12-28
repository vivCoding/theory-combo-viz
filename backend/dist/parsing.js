"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVarsAndInferredTypes = getVarsAndInferredTypes;
exports.parseToAst = parseToAst;
const nearley_1 = require("nearley");
const int_1 = require("./ast/theories/int");
const logic_1 = require("./ast/theories/logic");
const set_1 = require("./ast/theories/set");
const grammar_1 = __importDefault(require("./grammar"));
function flattenConjuntDisjunct(data) {
    if (data.type === "conjunct" || data.type === "disjunct") {
        const newPreds = [];
        for (const pred of data.preds) {
            const newPred = flattenConjuntDisjunct(pred);
            if ((pred.type === "conjunct" && data.type == "conjunct") || (pred.type == "disjunct" && data.type == "disjunct")) {
                newPreds.push(...newPred.preds);
            }
            else {
                newPreds.push(newPred);
            }
        }
        data.preds = newPreds;
    }
    return data;
}
function CType(t, ...args) {
    return [t, ...args].join("_");
}
function getParentType(t) {
    return t.split("_")[0];
}
function getChildrenType(t) {
    const c = t.split("_");
    return t.split("_")[1] ?? "";
}
const Types = {
    Int: CType("Int"),
    Bool: CType("Bool"),
    Unknown: CType("Unknown"),
    Set: CType("Set"),
    Arr: CType("Arr"),
};
let setEmptyVarsCt = 0;
function createSetEmptyVars(data) {
    // console.log(varMap)
    switch (data.type) {
        case "arithOp":
            return data;
        case "const":
            return data;
        case "var":
            return data;
        case "mathCompOp":
            data.left = createSetEmptyVars(data.left);
            data.right = createSetEmptyVars(data.right);
            return data;
        case "not":
            return data;
        case "eqCompOp":
            data.left = createSetEmptyVars(data.left);
            data.right = createSetEmptyVars(data.right);
            return data;
        case "set":
            return data;
        case "setOp":
            return data;
        case "setCompOp":
            data.left = createSetEmptyVars(data.left);
            data.right = createSetEmptyVars(data.right);
            return data;
        case "setElemOp":
            data.left = createSetEmptyVars(data.left);
            data.right = createSetEmptyVars(data.right);
            return data;
        case "setEmpty":
            return {
                type: "var",
                name: `__SET_EMPTY_VAR_${setEmptyVarsCt++}`,
            };
        case "arrayRead":
            return data;
        case "arrayWrite":
            return data;
        case "pred":
            data.value = createSetEmptyVars(data.value);
            return data;
        case "disjunct":
            const newPreds = [];
            for (const elem of data.preds) {
                newPreds.push(createSetEmptyVars(elem));
            }
            data.preds = newPreds;
            return data;
        case "conjunct":
            const newPreds2 = [];
            for (const elem of data.preds) {
                newPreds2.push(createSetEmptyVars(elem));
            }
            data.preds = newPreds2;
            return data;
        default:
            console.log("YIKES this shouldn't have happened, createEmptySetVars", data);
            throw "YIKES this shouldn't have happened" + data;
        // return Types.Unknown
    }
}
function typeinferVarsInner(data, varMap) {
    switch (data.type) {
        case "arithOp":
            const leftType = typeinferVarsInner(data.left, varMap);
            const rightType = typeinferVarsInner(data.right, varMap);
            if (leftType !== Types.Unknown && leftType !== Types.Int)
                throw "bad type arith";
            if (rightType !== Types.Unknown && rightType !== Types.Int)
                throw "bad type arith";
            // both operands must be int
            if (data.left.type === "var") {
                varMap[data.left.name].type = Types.Int;
            }
            if (data.right.type === "var") {
                varMap[data.right.name].type = Types.Int;
            }
            return Types.Int;
        case "const":
            return Types.Int;
        case "var":
            if (!varMap.hasOwnProperty(data.name)) {
                varMap[data.name] = {
                    type: Types.Unknown,
                };
            }
            return varMap[data.name].type;
        case "mathCompOp":
            const mcl = typeinferVarsInner(data.left, varMap);
            const mcr = typeinferVarsInner(data.right, varMap);
            if (mcl !== Types.Unknown && mcl !== Types.Int)
                throw "bad type mathCompOp";
            if (mcr !== Types.Unknown && mcr !== Types.Int)
                throw "bad type mathCompOp";
            // if variables unknown, set them to be int
            if (data.left.type === "var" && varMap[data.left.name].type === Types.Unknown) {
                varMap[data.left.name].type = Types.Int;
            }
            if (data.right.type === "var" && varMap[data.right.name].type === Types.Unknown) {
                varMap[data.right.name].type = Types.Int;
            }
            return Types.Bool;
        case "not":
            // const notValType = typeinferVarsInner(data.value, varMap)
            // if (notValType !== Types.Unknown && notValType !== Types.Bool) {
            //   throw "bad type not"
            // }
            // if (notValType === Types.Unknown) {
            //   varMap[data.value.name].type = Types.Bool
            // }
            throw "not implemented logic";
        case "eqCompOp":
            const el = typeinferVarsInner(data.left, varMap);
            const er = typeinferVarsInner(data.right, varMap);
            if (el !== Types.Unknown && er !== Types.Unknown && getParentType(el) !== getParentType(er))
                throw "bad type eqCompOp (parent)";
            const cel = getChildrenType(el);
            const cer = getChildrenType(er);
            if (getParentType(el) !== Types.Unknown && getParentType(er) !== Types.Unknown && cel !== Types.Unknown && cer !== Types.Unknown && cel !== cer)
                throw "bad type eqCompOp (children)";
            // check if both of them are vars, and if they are, assign types accordingingly
            // also check child types
            if (data.left.type == "var" && data.right.type == "var") {
                if ((el === Types.Unknown || getChildrenType(el) === Types.Unknown) && er !== Types.Unknown) {
                    varMap[data.left.name].type = er;
                }
                else if (el !== Types.Unknown && (er === Types.Unknown || getChildrenType(er) === Types.Unknown)) {
                    varMap[data.right.name].type = el;
                }
                else {
                    // if both unknown, leave them as unknown
                }
            }
            else {
                // one of them is not a variable. If one of them is (and its unknown), set it to the type of the other
                // also check child types
                if (data.left.type == "var" && (el === Types.Unknown || getChildrenType(el) === Types.Unknown)) {
                    varMap[data.left.name].type = er;
                }
                if (data.right.type == "var" && (er === Types.Unknown || getChildrenType(er) === Types.Unknown)) {
                    varMap[data.right.name].type = el;
                }
            }
            // need to handle arrays slightly differently
            if (data.left.type === "arrayRead" && getChildrenType(el) === Types.Unknown) {
                if (data.right.type === "arrayRead") {
                    varMap[data.left.arr.name].type = er;
                }
                else {
                    varMap[data.left.arr.name].type = CType(Types.Arr, er);
                }
            }
            if (data.right.type === "arrayRead" && getChildrenType(er) === Types.Unknown) {
                if (data.left.type === "arrayRead") {
                    varMap[data.right.arr.name].type = el;
                }
                else {
                    varMap[data.right.arr.name].type = CType(Types.Arr, el);
                }
            }
            if (data.left.type === "arrayWrite" && cel === Types.Unknown) {
                varMap[data.left.arr.name].type = er;
            }
            if (data.right.type === "arrayWrite" && cer === Types.Unknown) {
                varMap[data.right.arr.name].type = el;
            }
            return Types.Bool;
        case "set":
            // ensure every elem has the same type
            // keep track of the current type of the elem (shud not chnage theoretically)
            let currType = Types.Unknown;
            const vars = [];
            for (const elem of data.data) {
                const elemType = typeinferVarsInner(elem, varMap);
                // if we have a var and its unknown, add it to vars so we'll set it later
                if (elem.type == "var" && elemType == Types.Unknown) {
                    vars.push(elem);
                }
                else {
                    if (currType !== Types.Unknown && elemType !== currType) {
                        throw "bad type set";
                    }
                    currType = typeinferVarsInner(elem, varMap);
                }
            }
            // set all vars to have same type as other elements
            for (const v of vars) {
                varMap[v.name].type = currType;
            }
            return CType(Types.Set, currType);
        case "setOp":
            const sl = typeinferVarsInner(data.left, varMap);
            const sr = typeinferVarsInner(data.right, varMap);
            if (sl !== Types.Unknown && getParentType(sl) !== Types.Set)
                throw "bad type setOp (parent left)" + data;
            if (sr !== Types.Unknown && getParentType(sr) !== Types.Set)
                throw "bad type setOp (parent right)" + data;
            const csl = getChildrenType(sl);
            const csr = getChildrenType(sr);
            // if its children are not the same type, get outta here
            if (sl !== Types.Unknown && sr !== Types.Unknown && csl !== Types.Unknown && csr !== Types.Unknown && csl !== csr)
                throw "bad type setOp (child) " + data;
            let finalType = sl;
            if (sl === Types.Unknown || sr === Types.Unknown) {
                // if some vars are unknown, set its type
                if (data.left.type === "var" && sl === Types.Unknown) {
                    varMap[data.left.name].type = sr;
                    finalType = sr;
                }
                if (data.right.type === "var" && sr === Types.Unknown) {
                    varMap[data.right.name].type = sl;
                    finalType = sl;
                }
            }
            if (csl === Types.Unknown || csr === Types.Unknown) {
                // if some elem types unknown, set its type
                if (data.left.type === "var" && csl === Types.Unknown) {
                    varMap[data.left.name].type = csr;
                    finalType = CType(Types.Set, csr);
                }
                if (data.right.type === "var" && csr === Types.Unknown) {
                    varMap[data.right.name].type = csl;
                    finalType = CType(Types.Set, csl);
                }
            }
            return finalType;
        case "setElemOp":
            const sel = typeinferVarsInner(data.left, varMap);
            let ser = typeinferVarsInner(data.right, varMap);
            if (ser !== Types.Unknown && getParentType(ser) !== Types.Set)
                throw "bad type setElemOp (parent)";
            if (data.right.type === "var") {
                if (ser === Types.Unknown) {
                    varMap[data.right.name].type = CType(Types.Set, Types.Unknown);
                    ser = CType(Types.Set, Types.Unknown);
                }
            }
            const cser = getChildrenType(ser);
            if (sel !== Types.Unknown) {
                if (cser === Types.Unknown) {
                    varMap[data.right.name].type = CType(Types.Set, sel);
                }
                else if (sel !== cser) {
                    throw "bad type setElemOp (child)";
                }
            }
            else {
                if (cser !== Types.Unknown) {
                    varMap[data.left.name].type = cser;
                }
                else {
                    // we still don't know
                }
            }
            return Types.Bool;
        case "setEmpty":
            throw "shouldn't happen, all setEmpty should be gone";
        case "arrayRead":
            const arrt = typeinferVarsInner(data.arr, varMap);
            const idxt = typeinferVarsInner(data.idx, varMap);
            if (arrt !== Types.Unknown && getParentType(arrt) !== Types.Arr)
                throw "bad type arrayRead";
            if (idxt !== Types.Unknown && idxt !== Types.Int)
                throw "bad type arrayRead";
            if (arrt === Types.Unknown) {
                varMap[data.arr.name].type = CType(Types.Arr, Types.Unknown);
            }
            if (idxt === Types.Unknown) {
                varMap[data.idx.name].type = Types.Int;
            }
            // array read returns elem
            const elemType = arrt === Types.Unknown ? Types.Unknown : getChildrenType(arrt);
            return elemType;
        case "arrayWrite":
            const awt = typeinferVarsInner(data.arr, varMap);
            const iwt = typeinferVarsInner(data.idx, varMap);
            const vt = typeinferVarsInner(data.value, varMap);
            if (awt !== Types.Unknown && getParentType(awt) !== Types.Arr)
                throw "bad type arrayWrite (arr)";
            if (iwt !== Types.Unknown && iwt !== Types.Int)
                throw "bad type arrayWrite (idx)";
            // array read returns elem
            let et = awt === Types.Unknown ? Types.Unknown : getChildrenType(awt);
            if (vt !== Types.Unknown && et !== Types.Unknown && vt !== et)
                throw "bad type arrayWrite (elem)";
            if (vt === Types.Unknown) {
                if (et === Types.Unknown) {
                    // can't do anything, elem is still unknown
                }
                else {
                    // has to be a var if it's unknown (else it's a int const)
                    varMap[data.value.name].type = et;
                }
            }
            else {
                if (et === Types.Unknown) {
                    // we know type of new elem, but we didn't know type of old elems before. Now we do
                    et = vt;
                }
            }
            // set the array type. If it was unknown before, it's either known now (based on elem type), or just an array with unknown elem type
            varMap[data.arr.name].type = CType(Types.Arr, et);
            return varMap[data.arr.name].type;
        case "pred":
            const pval = typeinferVarsInner(data.value, varMap);
            if (data.value.type === "var" && pval !== Types.Bool) {
                if (pval === Types.Unknown) {
                    varMap[data.value.name].type = Types.Bool;
                }
                else {
                    throw `bad type pred, pred ${data.value.name}`;
                }
            }
            return Types.Bool;
        case "disjunct":
            for (const elem of data.preds) {
                typeinferVarsInner(elem, varMap);
            }
            return Types.Bool;
        case "conjunct":
            for (const elem of data.preds) {
                typeinferVarsInner(elem, varMap);
            }
            return Types.Bool;
        default:
            console.log("YIKES this shouldn't have happened", data);
            throw "YIKES this shouldn't have happened" + data.type;
        // return Types.Unknown
    }
}
function createAstInner(data, varMap) {
    switch (data.type) {
        case "arithOp":
            const left = createAstInner(data.left, varMap);
            const right = createAstInner(data.right, varMap);
            switch (data.op) {
                case "+":
                    return (0, int_1.add)(left, right);
                case "-":
                    return (0, int_1.sub)(left, right);
                case "*":
                    return (0, int_1.mul)(left, right);
                case "/":
                    return (0, int_1.div)(left, right);
                default:
                    throw "YIKES this shouldn't have happened " + data.type + " " + data.op;
            }
        case "const":
            if (data.value < 0) {
                return (0, int_1.neg)((0, int_1.intval)(data.value));
            }
            return (0, int_1.intval)(data.value);
        case "var":
            const vType = varMap[data.name].type;
            if (data.name.indexOf("__SET_EMPTY_VAR_") === 0) {
                const childType = getChildrenType(vType);
                switch (childType) {
                    case Types.Int:
                        return (0, set_1.empty)(int_1.Int);
                    default:
                        throw "idk not implemented";
                }
            }
            if (vType === Types.Int) {
                return int_1.Int.constant(data.name);
            }
            else if (vType === Types.Bool) {
                return logic_1.Bool.constant(data.name);
            }
            else if (getParentType(vType) === Types.Set) {
                const childType = getChildrenType(vType);
                switch (childType) {
                    case Types.Int:
                        return (0, set_1.Set)(int_1.Int).constant(data.name);
                    case Types.Bool:
                        return (0, set_1.Set)(logic_1.Bool).constant(data.name);
                    default:
                        throw "idk not implemented";
                }
            }
            else if (vType === Types.Unknown) {
                return int_1.Int.constant(data.name);
            }
        case "mathCompOp":
            const mcl = createAstInner(data.left, varMap);
            const mcr = createAstInner(data.right, varMap);
            switch (data.op) {
                case ">=":
                    return (0, int_1.ge)(mcl, mcr);
                case "<=":
                    return (0, int_1.le)(mcl, mcr);
                case ">":
                    return (0, int_1.gt)(mcl, mcr);
                case "<":
                    return (0, int_1.lt)(mcl, mcr);
                default:
                    throw "YIKES this shouldn't have happened " + data.type + " " + data.op;
            }
        case "not":
            const val = createAstInner(data.value, varMap);
            return (0, logic_1.not)(val);
        case "eqCompOp":
            const lcl = createAstInner(data.left, varMap);
            const lcr = createAstInner(data.right, varMap);
            switch (data.op) {
                case "==":
                    return (0, logic_1.eq)(lcl, lcr);
                case "!=":
                    return (0, logic_1.neq)(lcl, lcr);
                default:
                    throw "YIKES this shouldn't have happened " + data.type + " " + data.op;
            }
        case "set":
            const setVals = [];
            for (const elem of data.data) {
                const elemAst = createAstInner(elem, varMap);
                setVals.push(elemAst);
            }
            return (0, set_1.set)(...setVals);
        case "setOp":
            const sl = createAstInner(data.left, varMap);
            const sr = createAstInner(data.right, varMap);
            switch (data.op) {
                case "∪":
                    return (0, set_1.union)(sl, sr);
                case "∩":
                    return (0, set_1.intersect)(sl, sr);
                case "\\":
                    return (0, set_1.diff)(sl, sr);
                default:
                    throw "YIKES this shouldn't have happened " + data.type + " " + data.op;
            }
        case "setElemOp":
            const sel = createAstInner(data.left, varMap);
            const ser = createAstInner(data.right, varMap);
            switch (data.op) {
                case "∈":
                    return (0, set_1.elemof)(sel, ser);
                case "∉":
                    return (0, logic_1.not)((0, set_1.elemof)(sel, ser));
                default:
                    throw "YIKES this shouldn't have happened " + data.type + " " + data.op;
            }
        case "setEmpty":
            throw "shouldn't happen, all setEmpty should be gone";
        case "pred":
            return createAstInner(data.value, varMap);
        case "disjunct":
            const preds = [];
            for (const elem of data.preds) {
                const pred = createAstInner(elem, varMap);
                preds.push(pred);
            }
            return (0, logic_1.or)(...preds);
        case "conjunct":
            const preds2 = [];
            for (const elem of data.preds) {
                const pred2 = createAstInner(elem, varMap);
                preds2.push(pred2);
            }
            return (0, logic_1.and)(...preds2);
        default:
            throw "YIKES this shouldn't have happened" + data;
    }
}
function getVarsAndInferredTypes(input, varMap = {}) {
    setEmptyVarsCt = 0;
    const parser = new nearley_1.Parser(nearley_1.Grammar.fromCompiled(grammar_1.default));
    try {
        parser.feed(input.split(" ").join("").trim());
    }
    catch (e) {
        throw "Error parsing" + e;
    }
    // ensure parser ended up with something
    if (parser.results.length < 1)
        throw "Parsing - No output/nothing to parse";
    const res = parser.results[0];
    const t1 = flattenConjuntDisjunct(res);
    const t2 = createSetEmptyVars(t1);
    try {
        // figure out the type/sorts of each var
        for (let i = 0; i < 3; i++) {
            typeinferVarsInner(t2, varMap);
        }
    }
    catch (e) {
        throw "Error inferring types " + e;
    }
    // since we just want vars, delete set empty vars
    for (const vname in varMap) {
        if (vname.indexOf("__SET_EMPTY_VAR_") === 0) {
            delete varMap[vname];
        }
    }
    return varMap;
}
function parseToAst(input, varMap = {}) {
    setEmptyVarsCt = 0;
    const parser = new nearley_1.Parser(nearley_1.Grammar.fromCompiled(grammar_1.default));
    try {
        parser.feed(input.split(" ").join("").trim());
    }
    catch (e) {
        throw "Error parsing" + e;
    }
    // ensure parser ended up with something
    if (parser.results.length < 1)
        throw "Parsing - No output/nothing to parse";
    const res = parser.results[0];
    const t1 = flattenConjuntDisjunct(res);
    const t2 = createSetEmptyVars(t1);
    try {
        // figure out the type/sorts of each var
        for (let i = 0; i < 3; i++) {
            typeinferVarsInner(t2, varMap);
        }
    }
    catch (e) {
        throw "Error inferring types - " + e;
    }
    // if there are still unknowns, throw error
    for (const vname in varMap) {
        if (varMap[vname].type.indexOf(Types.Unknown) !== -1) {
            throw "Formula contains variables with unknown types";
        }
    }
    const parseTree = t2;
    try {
        const ast = createAstInner(parseTree, varMap);
        return ast;
    }
    catch (e) {
        throw "Error creating ast - " + e;
    }
}