"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const witness_1 = require("./witness");
const int_1 = require("../ast/theories/int");
const logic_1 = require("../ast/theories/logic");
const set_1 = require("../ast/theories/set");
test("basic", () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const ast = (0, logic_1.and)((0, logic_1.neq)((0, set_1.set)(a, b), S), (0, logic_1.eq)((0, set_1.set)(a, b, (0, int_1.add)(a, b)), S), (0, logic_1.eq)(b, (0, int_1.intval)(0)));
    expect((0, witness_1.setWitness)(ast).ast).not.toEqual(ast);
});
