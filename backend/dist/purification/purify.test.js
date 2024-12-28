"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_1 = require("./purify");
const int_1 = require("../ast/theories/int");
const logic_1 = require("../ast/theories/logic");
const set_1 = require("../ast/theories/set");
const theory_1 = require("../theory/theory");
test("basic", () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const ast = (0, logic_1.and)((0, logic_1.eq)((0, set_1.set)(a, b, (0, int_1.add)(a, b)), S), (0, logic_1.neq)((0, set_1.set)(a, b), S), (0, logic_1.eq)(b, (0, int_1.intval)(0)));
    const p = (0, purify_1.purification)([theory_1.baseTheory, theory_1.intTheory, theory_1.setTheory], ast);
    for (const th of p) {
        console.log(th ? th.fmt() : "null");
    }
});
