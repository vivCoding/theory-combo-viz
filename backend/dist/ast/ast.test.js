"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const int_1 = require("./theories/int");
const logic_1 = require("./theories/logic");
const set_1 = require("./theories/set");
const typecheck_1 = require("./typecheck");
const z3convert_1 = require("./z3convert");
const bitvec_1 = require("./theories/bitvec");
test("basic", () => {
    const a = int_1.Int.constant("a");
    const ast = (0, logic_1.and)((0, logic_1.neq)((0, set_1.set)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(10)), (0, int_1.intval)(11)), (0, set_1.single)(a)), (0, set_1.elemof)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(10)), (0, set_1.single)(a)));
    expect((0, set_1.set)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(10)), (0, int_1.intval)(11)).typecheck()).toEqual((0, set_1.Set)(int_1.Int));
    expect(ast.typecheck()).toEqual(logic_1.Bool);
});
test("nested_set", () => {
    const a = int_1.Int.constant("a");
    const ast = (0, set_1.set)((0, set_1.set)((0, int_1.mul)((0, int_1.intval)(1), a), (0, int_1.intval)(10)), (0, set_1.single)(a));
    expect(ast.typecheck()).toEqual((0, set_1.Set)((0, set_1.Set)(int_1.Int)));
});
test("unify", () => {
    const a = ast_1.SORT.constant("a");
    const constants = (0, typecheck_1.freeconstants_map)([a]);
    expect((0, typecheck_1.UNIFY)((0, set_1.Set)(int_1.Int), (0, set_1.Set)(a), constants)).toBe(true);
});
test("set example 1", async () => {
    const S = (0, set_1.Set)(int_1.Int).constant("set");
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, S)), (0, set_1.subsetof)((0, set_1.set)(a, b), S))));
    expect(result.status).toStrictEqual("unsat");
});
test("set example 2", async () => {
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, S)), (0, logic_1.neq)(S, (0, set_1.empty)(int_1.Int)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set example 3", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const T = (0, set_1.set)(a, b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, T)), (0, logic_1.eq)(S, T))));
    expect(result.status).toStrictEqual("sat");
});
test("set union 1", async () => {
    const S = (0, set_1.Set)(int_1.Int).constant("S");
    const T = (0, set_1.Set)(int_1.Int).constant("T");
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, T)), (0, set_1.subsetof)((0, set_1.set)(a, b), (0, set_1.union)(S, T)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set union 2", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const c = int_1.Int.constant("c");
    const S = (0, set_1.set)(a, b);
    const T = (0, set_1.set)(c);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, T)), (0, logic_1.eq)((0, set_1.set)(a, b, c), (0, set_1.union)(S, T)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set union 3", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const c = int_1.Int.constant("c");
    const S = (0, set_1.set)(a, b);
    const T = (0, set_1.set)(c);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, set_1.subsetof)((0, set_1.union)(S, T), (0, set_1.set)(a, b, c))));
    expect(result.status).toStrictEqual("unsat");
});
test("set intersect", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a);
    const T = (0, set_1.set)(b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, logic_1.neq)(a, b)), (0, logic_1.eq)((0, set_1.intersect)(S, T), (0, set_1.empty)(int_1.Int)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set intersect 2", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a);
    const T = (0, set_1.set)(a, b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, logic_1.neq)(a, b)), (0, logic_1.neq)((0, set_1.intersect)(S, T), (0, set_1.empty)(int_1.Int)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set intersect ", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a);
    const T = (0, set_1.set)(a, b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.and)((0, logic_1.neq)(a, b)), (0, logic_1.neq)((0, set_1.intersect)(S, T), (0, set_1.empty)(int_1.Int)))));
    expect(result.status).toStrictEqual("unsat");
});
test("set diff", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a);
    const T = (0, set_1.set)(a);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.eq)((0, set_1.diff)(S, T), (0, set_1.empty)(int_1.Int))));
    expect(result.status).toStrictEqual("unsat");
});
test("set diff 2", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a);
    const T = (0, set_1.set)(b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.neq)(a, b), (0, logic_1.eq)((0, set_1.diff)(S, T), S))));
    expect(result.status).toStrictEqual("unsat");
});
test("set diff 3", async () => {
    const a = int_1.Int.constant("a");
    const b = int_1.Int.constant("b");
    const S = (0, set_1.set)(a, b);
    const T = (0, set_1.set)(b);
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.neq)(a, b), (0, logic_1.eq)((0, set_1.diff)(S, T), (0, set_1.set)(a)))));
    expect(result.status).toStrictEqual("unsat");
});
test("int arith", async () => {
    // doesn't test rigorously, but meh we don't need to
    let res = await (0, z3convert_1.solve)((0, logic_1.neq)((0, int_1.add)((0, int_1.intval)(2), (0, int_1.intval)(3)), (0, int_1.intval)(5)));
    expect(res.status).toStrictEqual("unsat");
    res = await (0, z3convert_1.solve)((0, logic_1.neq)((0, int_1.mul)((0, int_1.intval)(2), (0, int_1.intval)(3)), (0, int_1.intval)(6)));
    expect(res.status).toStrictEqual("unsat");
    res = await (0, z3convert_1.solve)((0, logic_1.neq)((0, int_1.sub)((0, int_1.intval)(3), (0, int_1.intval)(2)), (0, int_1.intval)(1)));
    expect(res.status).toStrictEqual("unsat");
    res = await (0, z3convert_1.solve)((0, logic_1.neq)((0, int_1.div)((0, int_1.intval)(6), (0, int_1.intval)(2)), (0, int_1.intval)(3)));
    expect(res.status).toStrictEqual("unsat");
});
test("set+int example 1", async () => {
    const S = (0, set_1.Set)(int_1.Int).constant("set");
    const a = (0, int_1.add)((0, int_1.intval)(2), (0, int_1.intval)(3));
    const b = (0, int_1.intval)(5);
    // a in S --> b in S
    let result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, set_1.elemof)(a, S), (0, set_1.elemof)(b, S))));
    expect(result.status).toStrictEqual("unsat");
    // S = {a} --> S == {b}
    result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.implies)((0, logic_1.eq)(S, (0, set_1.set)(a)), (0, set_1.elemof)(b, S))));
    expect(result.status).toStrictEqual("unsat");
});
test("set+int example 2", async () => {
    // S = {2 + 3}
    // T = {1 + 4}
    const S = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(2), (0, int_1.intval)(3)));
    const T = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(4)));
    // S \ T == empty
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.eq)((0, set_1.diff)(S, T), (0, set_1.empty)(int_1.Int))));
    expect(result.status).toStrictEqual("unsat");
});
test("set+int example 3", async () => {
    const S = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(2), (0, int_1.intval)(3)));
    const T = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(4)));
    // S | T == {4}
    const result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.eq)((0, set_1.union)(S, T), (0, set_1.set)((0, int_1.intval)(5)))));
    expect(result.status).toStrictEqual("unsat");
});
test.only("set+int example 4", async () => {
    const S = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(2), (0, int_1.intval)(3)), (0, int_1.mul)((0, int_1.intval)(1), (0, int_1.intval)(2)));
    const T = (0, set_1.set)((0, int_1.add)((0, int_1.intval)(1), (0, int_1.intval)(4)));
    // S = {2 + 3, 1 * 2}
    // T = {1 + 4}
    // S | T & {3} == empty
    let result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.eq)((0, set_1.intersect)((0, set_1.union)(S, T), (0, set_1.set)((0, int_1.intval)(3))), (0, set_1.empty)(int_1.Int))));
    expect(result.status).toStrictEqual("unsat");
    // S | T & {5, 6} == {5}
    result = await (0, z3convert_1.solve)((0, logic_1.not)((0, logic_1.eq)((0, set_1.intersect)((0, set_1.union)(S, T), (0, set_1.set)((0, int_1.intval)(5), (0, int_1.intval)(6))), (0, set_1.set)((0, int_1.intval)(5)))));
    expect(result.status).toStrictEqual("unsat");
});
test("bitvec example 1", async () => {
    const a = (0, bitvec_1.BitVec)((0, int_1.intval)(64)).constant("a");
    // S | T == {4}
    let result = await (0, z3convert_1.solve)((0, logic_1.not)((0, bitvec_1.bvugt)((0, bitvec_1.bvor)(a, (0, int_1.intval)(4)), a)));
    expect(result.status).toStrictEqual("unsat");
});
