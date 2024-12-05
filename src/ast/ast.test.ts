import { result } from "lodash"
import { Ast, SORT } from "./ast"
import { add, Int, intval, mul } from "./theories/int"
import { and, Bool, eq, implies, neq, not } from "./theories/logic"
import { Set, diff, elemof, empty, intersect, set, single, subsetof, union } from "./theories/set"
import { freeconstants_map, UNIFY } from "./typecheck"

import { solve } from "./z3convert"

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
  const res = await solve(neq(add(intval(2), intval(3)), intval(5)))
  expect(res.status).toStrictEqual("unsat")
})
