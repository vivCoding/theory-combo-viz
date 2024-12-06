import { Ast, SORT } from "../ast/ast"
import { add, gt, Int, intval, mul } from "../ast/theories/int"
import { and, Bool, eq, implies, neq, not } from "../ast/theories/logic"
import { Set, diff, elemof, empty, intersect, set, single, subsetof, union } from "../ast/theories/set"
import { freeconstants_map, UNIFY } from "../ast/typecheck"

import { solve } from "../ast/z3convert"
import { arrayTheory, intTheory, setTheory } from "../theory/theory"
import { combine, generate_classes_all_sorts, generate_eqclasses } from "./combine"
import { Arr, select } from "../ast/theories/array"

// test('generate eqclasses', () => {
//   console.log(generate_classes_all_sorts([1, 2, 3, 4, 5]).toArray().map((x) => x.join(" ")).join(", "))
// })

test("set example 1", async () => {
  const solver = combine(setTheory, intTheory)
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const T = Set(Int).constant("T")
  const conj = implies(
    and(eq(set(a), S), eq(b, add(a, intval(1))), eq(set(b), T)),
    neq(S, T)
  );
  const result = await solver(not(conj));

  expect(result.status).toStrictEqual("unsat")
})

test("set example 2", async () => {
  const solver = combine(setTheory, intTheory)
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const T = Set(Int).constant("T")
  const conj = implies(
    and(elemof(a, S), eq(b, add(a, intval(1))), elemof(b, T)),
    neq(S, T)
  );
  const result = await solver(not(conj));

  expect(result.status).toStrictEqual("sat")
})

test("set example 3", async () => {
  const solver = combine(setTheory, intTheory)
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const T = Set(Int).constant("T")
  const conj = implies(
    and(eq(set(a), S), eq(set(b), T), eq(a, b)),
    neq(S, T)
  );
  const result = await solver(not(conj));

  expect(result.status).toStrictEqual("sat")
})


test("array example 1", async () => {
  const solver = combine(arrayTheory, intTheory)
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Arr(Int).constant("S")
  const conj = implies(
    gt(select(S, a), select(S, b)),
    neq(a, b)
  );
  const result = await solver(not(conj));

  expect(result.status).toStrictEqual("unsat")
}, 10000)

test("array example 2", async () => {
  const solver = combine(arrayTheory, intTheory)
  const a = Int.constant("a")
  const S = Arr(Int).constant("S")
  const T = Arr(Int).constant("T")
  const conj = implies(
    gt(select(S, a), select(T, a)),
    neq(T, S)
  );
  const result = await solver(not(conj));

  expect(result.status).toStrictEqual("unsat")
}, 10000)