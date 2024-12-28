"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set2model1 = set2model1;
exports.set2model2 = set2model2;
exports.init_purificaiton_result = init_purificaiton_result;
exports.combine = combine;
exports.generate_classes_all_sorts = generate_classes_all_sorts;
exports.generate_eqneqs = generate_eqneqs;
exports.eqclass2eqs = eqclass2eqs;
exports.eqclasses2eqneqs = eqclasses2eqneqs;
exports.generate_eqclasses = generate_eqclasses;
exports.allsplits = allsplits;
const z3_solver_1 = require("z3-solver");
const logic_1 = require("../ast/theories/logic");
const z3convert_1 = require("../ast/z3convert");
const purify_1 = require("../purification/purify");
const utils_1 = require("../purification/utils");
const theory_1 = require("../theory/theory");
function set2model1(result) {
    if (result.status === "sat") {
        return { status: "sat", model1: result.model };
    }
    else {
        return result;
    }
}
function set2model2(result) {
    if (result.status === "sat") {
        return { status: "sat", model2: result.model };
    }
    else {
        return result;
    }
}
function findWordsStartingWithP(inputString) {
    // Use a regular expression to match words starting with '__p'
    const regex = /\b__p\w*\b/g;
    // Match all words in the string that match the pattern
    const matches = inputString.match(regex);
    // Return the array of matched words, or an empty array if no matches are found
    return matches || [];
}
function findWordsStartingWithE(inputString) {
    // Use a regular expression to match words starting with '__p'
    const regex = /\b__e\w*\b/g;
    // Match all words in the string that match the pattern
    const matches = inputString.match(regex);
    // Return the array of matched words, or an empty array if no matches are found
    return matches || [];
}
function findWordsNotStartingWithP(inputString) {
    // Regular expression to match words (letters and numbers, no isolated numbers)
    const regex = /\b[A-Za-z][A-Za-z0-9]*\b/g;
    // Find all matches in the string
    const words = inputString.match(regex) || [];
    // Filter out words that start with '__p'
    const result = words.filter((word) => !word.startsWith("__p"));
    return result;
}
function init_purificaiton_result(result) {
    var [base_fomula, formula1, formula2] = result;
    return [
        base_fomula && formula1 ? (0, logic_1.and)(formula1, base_fomula) : formula1,
        base_fomula && formula2 ? (0, logic_1.and)(formula2, base_fomula) : formula2,
    ];
}
function combine(theory1, theory2) {
    return async function (formula) {
        const steps = [];
        // eslint-disable-next-line prefer-const
        var [formula1, formula2] = init_purificaiton_result((0, purify_1.purification)([theory_1.baseTheory, theory1, theory2], formula));
        if (formula1 === null) {
            if (formula2 !== null) {
                return set2model2(await (0, z3convert_1.solve)(formula2));
            }
            else {
                return { status: "unknown", steps };
            }
        }
        if (formula2 === null) {
            if (formula1 !== null) {
                return set2model1(await (0, z3convert_1.solve)(formula1));
            }
            else {
                return { status: "unknown", steps };
            }
        }
        const { Context } = await (0, z3_solver_1.init)();
        const ctx = Context("main");
        console.log(`purification: ${formula1?.fmt()}, ${formula2?.fmt()}`);
        const oldVars = [...new Set(findWordsNotStartingWithP(formula1.fmt()).concat(findWordsNotStartingWithP(formula2.fmt())))].sort();
        const newVars = [...new Set(findWordsStartingWithP(formula1.fmt()).concat(findWordsStartingWithP(formula2.fmt())))].sort();
        steps.push({
            type: "purification",
            f1: formula1.fmt(),
            f2: formula2.fmt(),
            oldVars,
            newVars,
        });
        const oldF1 = formula1.fmt();
        formula1 = theory1.witness(formula1).ast;
        console.log(`finite witness: ${formula1?.fmt()}`);
        const newWitnessVars = [...new Set(findWordsStartingWithE(formula1.fmt()))].sort();
        steps.push({
            type: "witness",
            f1: formula1.fmt(),
            changed: formula1.fmt() !== oldF1,
            newVars: newWitnessVars,
        });
        const vars = (0, utils_1.variables)(formula1);
        const map = new Map();
        for (const v of vars) {
            if (map.has(v.sort.fmt())) {
                map.get(v.sort.fmt()).push(v);
            }
            else {
                map.set(v.sort.fmt(), [v]);
            }
        }
        for (const eqclass of generate_classes_all_sorts(Array.from(map.values()))) {
            // console.log(eqclass.flat().map((x) => x.map((y) => y.name).join("=")).join(" "))
            const eqneqs = eqclass.map((x) => eqclasses2eqneqs(x)).flat();
            // console.log(eqneqs.map((x) => x.fmt()).join(", "))
            const ast1 = (0, logic_1.and)(formula1, ...eqneqs);
            const ast2 = (0, logic_1.and)(formula2, ...eqneqs);
            const result1 = await (0, z3convert_1.solve)(ast1);
            const result2 = await (0, z3convert_1.solve)(ast2);
            const arrangement = eqneqs.map((x) => {
                const [var1, op, var2] = x.fmt().split(" ");
                return { var1, op, var2 };
            });
            steps.push({
                type: "arrangement",
                arrangement,
                f1: formula1.fmt() + " ∧ ARR",
                f2: formula2.fmt() + " ∧ ARR",
                result1: result1.status,
                result2: result2.status,
            });
            if (result1.status === "sat" && result2.status === "sat") {
                return { status: "sat", model1: result1.model, model2: result2.model, steps };
            }
            else if (result1.status === "unknown" || result2.status === "unknown") {
                return { status: "unknown", steps };
            }
        }
        return { status: "unsat", steps };
    };
}
function* generate_classes_all_sorts(vars) {
    if (vars.length == 0) {
        yield [];
        return;
    }
    const [vs, ...rest] = vars;
    for (const eqclasses of generate_eqclasses(vs)) {
        for (const eqneqs of generate_classes_all_sorts(rest)) {
            yield [eqclasses, ...eqneqs];
        }
    }
}
function* generate_eqneqs(vars) {
    for (const eqclasses of generate_eqclasses(vars)) {
        yield eqclasses2eqneqs(eqclasses);
    }
}
function eqclass2eqs(eqclass) {
    return [...Array(eqclass.length - 1).keys()].map((i) => (0, logic_1.eq)(eqclass[i].as_ast(), eqclass[i + 1].as_ast()));
}
function eqclasses2eqneqs(eqclasses) {
    const neqs = [];
    for (let i = 0; i < eqclasses.length; i++) {
        for (let j = i + 1; j < eqclasses.length; j++) {
            neqs.push((0, logic_1.neq)(eqclasses[i][0].as_ast(), eqclasses[j][0].as_ast()));
        }
    }
    return [...eqclasses.map(eqclass2eqs), neqs].flat();
}
function* generate_eqclasses(vars) {
    if (vars.length > 0) {
        const [v, ...tail] = vars;
        for (const { selected, rest } of allsplits(tail)) {
            for (const eqs of generate_eqclasses(rest)) {
                yield [[v, ...selected], ...eqs];
            }
        }
    }
    else {
        yield [];
    }
    return undefined;
}
function split(array, i) {
    const selected = [];
    const rest = [];
    for (let j = 0; j < array.length; j++) {
        if ((i & (1 << j)) > 0) {
            selected.push(array[j]);
        }
        else {
            rest.push(array[j]);
        }
    }
    return { selected, rest };
}
function* allsplits(array) {
    for (let i = 0; i < 1 << array.length; i++) {
        yield split(array, i);
    }
}
