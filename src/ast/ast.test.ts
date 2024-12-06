import { result } from "lodash"
import { Ast, SORT } from "./ast"
import { Int, add, div, intval, mul, sub } from "./theories/int"
import { Bool, and, eq, implies, neq, not } from "./theories/logic"
import { Set, diff, elemof, empty, intersect, set, single, subsetof, union } from "./theories/set"
import { UNIFY, freeconstants_map } from "./typecheck"
import { solve } from "./z3convert"
import { BitVec, bvor, bvugt } from "./theories/bitvec"

test("basic", () => {
  const a = Int.constant("a")
  const ast = and(neq(set(add(intval(1), intval(10)), intval(11)), single(a)), elemof(add(intval(1), intval(10)), single(a)))

  expect(set(add(intval(1), intval(10)), intval(11)).typecheck()).toEqual(Set(Int))
  expect(ast.typecheck()).toEqual(Bool)
})

test("nested_set", () => {
  const a = Int.constant("a")
  const ast = set(set(mul(intval(1), a), intval(10)), single(a))

  expect(ast.typecheck()).toEqual(Set(Set(Int)))
})

test("unify", () => {
  const a = SORT.constant("a")
  const constants = freeconstants_map([a])
  expect(UNIFY(Set(Int), Set(a), constants)).toBe(true)
})

test("set example 1", async () => {
  const S = Set(Int).constant("set")
  const a = Int.constant("a")
  const b = Int.constant("b")

  const result = await solve(not(implies(and(elemof(a, S), elemof(b, S)), subsetof(set(a, b), S))))

  expect(result.status).toStrictEqual("unsat")
})

test("set example 2", async () => {
  const S = Set(Int).constant("S")
  const a = Int.constant("a")
  const b = Int.constant("b")

  const result = await solve(not(implies(and(elemof(a, S), elemof(b, S)), neq(S, empty(Int)))))

  expect(result.status).toStrictEqual("unsat")
})

test("set example 3", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const T = set(a, b)

  const result = await solve(not(implies(and(elemof(a, S), elemof(b, T)), eq(S, T))))

  expect(result.status).toStrictEqual("sat")
})

test("set union 1", async () => {
  const S = Set(Int).constant("S")
  const T = Set(Int).constant("T")
  const a = Int.constant("a")
  const b = Int.constant("b")

  const result = await solve(not(implies(and(elemof(a, S), elemof(b, T)), subsetof(set(a, b), union(S, T)))))

  expect(result.status).toStrictEqual("unsat")
})

test("set union 2", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const c = Int.constant("c")
  const S = set(a, b)
  const T = set(c)

  const result = await solve(not(implies(and(elemof(a, S), elemof(b, T)), eq(set(a, b, c), union(S, T)))))
  expect(result.status).toStrictEqual("unsat")
})

test("set union 3", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const c = Int.constant("c")
  const S = set(a, b)
  const T = set(c)

  const result = await solve(not(subsetof(union(S, T), set(a, b, c))))
  expect(result.status).toStrictEqual("unsat")
})

test("set intersect", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a)
  const T = set(b)

  const result = await solve(not(implies(and(neq(a, b)), eq(intersect(S, T), empty(Int)))))
  expect(result.status).toStrictEqual("unsat")
})

test("set intersect 2", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a)
  const T = set(a, b)

  const result = await solve(not(implies(and(neq(a, b)), neq(intersect(S, T), empty(Int)))))
  expect(result.status).toStrictEqual("unsat")
})

test("set intersect ", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a)
  const T = set(a, b)

  const result = await solve(not(implies(and(neq(a, b)), neq(intersect(S, T), empty(Int)))))
  expect(result.status).toStrictEqual("unsat")
})

test("set diff", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a)
  const T = set(a)

  const result = await solve(not(eq(diff(S, T), empty(Int))))
  expect(result.status).toStrictEqual("unsat")
})

test("set diff 2", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a)
  const T = set(b)

  const result = await solve(not(implies(neq(a, b), eq(diff(S, T), S))))
  expect(result.status).toStrictEqual("unsat")
})

test("set diff 3", async () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = set(a, b)
  const T = set(b)

  const result = await solve(not(implies(neq(a, b), eq(diff(S, T), set(a)))))
  expect(result.status).toStrictEqual("unsat")
})

test("int arith", async () => {
  // doesn't test rigorously, but meh we don't need to
  let res = await solve(neq(add(intval(2), intval(3)), intval(5)))
  expect(res.status).toStrictEqual("unsat")
  res = await solve(neq(mul(intval(2), intval(3)), intval(6)))
  expect(res.status).toStrictEqual("unsat")
  res = await solve(neq(sub(intval(3), intval(2)), intval(1)))
  expect(res.status).toStrictEqual("unsat")
  res = await solve(neq(div(intval(6), intval(2)), intval(3)))
  expect(res.status).toStrictEqual("unsat")
})

test("set+int example 1", async () => {
  const S = Set(Int).constant("set")
  const a = add(intval(2), intval(3))
  const b = intval(5)

  // a in S --> b in S
  let result = await solve(not(implies(elemof(a, S), elemof(b, S))))
  expect(result.status).toStrictEqual("unsat")

  // S = {a} --> S == {b}
  result = await solve(not(implies(eq(S, set(a)), elemof(b, S))))
  expect(result.status).toStrictEqual("unsat")
})

test("set+int example 2", async () => {
  // S = {2 + 3}
  // T = {1 + 4}
  const S = set(add(intval(2), intval(3)))
  const T = set(add(intval(1), intval(4)))

  // S \ T == empty
  const result = await solve(not(eq(diff(S, T), empty(Int))))
  expect(result.status).toStrictEqual("unsat")
})

test("set+int example 3", async () => {
  const S = set(add(intval(2), intval(3)))
  const T = set(add(intval(1), intval(4)))

  // S | T == {4}
  const result = await solve(not(eq(union(S, T), set(intval(5)))))
  expect(result.status).toStrictEqual("unsat")
})

test.only("set+int example 4", async () => {
  const S = set(add(intval(2), intval(3)), mul(intval(1), intval(2)))
  const T = set(add(intval(1), intval(4)))

  // S = {2 + 3, 1 * 2}
  // T = {1 + 4}
  // S | T & {3} == empty
  let result = await solve(not(eq(intersect(union(S, T), set(intval(3))), empty(Int))))
  expect(result.status).toStrictEqual("unsat")

  // S | T & {5, 6} == {5}
  result = await solve(not(eq(intersect(union(S, T), set(intval(5), intval(6))), set(intval(5)))))
  expect(result.status).toStrictEqual("unsat")
})

test("bitvec example 1", async () => {
  const a = BitVec(intval(64)).constant("a")

  // S | T == {4}
  let result = await solve(not(
    bvugt(bvor(a, intval(4)), a)
  ))
  expect(result.status).toStrictEqual("unsat")
})
