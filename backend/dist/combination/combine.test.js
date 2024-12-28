"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const int_1 = require("../ast/theories/int");
const logic_1 = require("../ast/theories/logic");
const set_1 = require("../ast/theories/set");
const theory_1 = require("../theory/theory");
const combine_1 = require("./combine");
const array_1 = require("../ast/theories/array");
// test('generate eqclasses', () => {
//   console.log(generate_classes_all_sorts([1, 2, 3, 4, 5]).toArray().map((x) => x.join(" ")).join(", "))
// })
test("set example 1", async () => {
    const solver = (0, combine_1.combine)(theory_1.setTheory, theory_1.intTheory);
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const T = (0, set_1.Set)(int_1.Int).constant("T");
    const conj = (0, logic_1.implies)((0, logic_1.and)((0, logic_1.eq)((0, set_1.set)(a), S), (0, logic_1.eq)(b, (0, int_1.add)(a, (0, int_1.intval)(1))), (0, logic_1.eq)((0, set_1.set)(b), T)), (0, logic_1.neq)(S, T));
    const result = await solver((0, logic_1.not)(conj));
    expect(result.status).toStrictEqual("unsat");
});
test("set example 2", async () => {
    const solver = (0, combine_1.combine)(theory_1.setTheory, theory_1.intTheory);
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const T = (0, set_1.Set)(int_1.Int).constant("T");
    const conj = (0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, logic_1.eq)(b, (0, int_1.add)(a, (0, int_1.intval)(1))), (0, set_1.elemof)(b, T)), (0, logic_1.neq)(S, T));
    const result = await solver((0, logic_1.not)(conj));
    expect(result.status).toStrictEqual("sat");
});
test("set example 3", async () => {
    const solver = (0, combine_1.combine)(theory_1.setTheory, theory_1.intTheory);
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const T = (0, set_1.Set)(int_1.Int).constant("T");
    const conj = (0, logic_1.implies)((0, logic_1.and)((0, logic_1.eq)((0, set_1.set)(a), S), (0, logic_1.eq)((0, set_1.set)(b), T), (0, logic_1.eq)(a, b)), (0, logic_1.neq)(S, T));
    const result = await solver((0, logic_1.not)(conj));
    expect(result.status).toStrictEqual("sat");
});
test("array example 1", async () => {
    const solver = (0, combine_1.combine)(theory_1.arrayTheory, theory_1.intTheory);
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, array_1.Arr)(int_1.Int).constant("S");
    const conj = (0, logic_1.implies)((0, int_1.gt)((0, array_1.select)(S, a), (0, array_1.select)(S, b)), (0, logic_1.neq)(a, b));
    const result = await solver((0, logic_1.not)(conj));
    expect(result.status).toStrictEqual("unsat");
}, 10000);
test("array example 2", async () => {
    const solver = (0, combine_1.combine)(theory_1.arrayTheory, theory_1.intTheory);
    const a = int_1.Int.constant("a");
    const S = (0, array_1.Arr)(int_1.Int).constant("S");
    const T = (0, array_1.Arr)(int_1.Int).constant("T");
    const conj = (0, logic_1.implies)((0, int_1.gt)((0, array_1.select)(S, a), (0, array_1.select)(T, a)), (0, logic_1.neq)(T, S));
    const result = await solver((0, logic_1.not)(conj));
    expect(result.status).toStrictEqual("unsat");
}, 10000);
