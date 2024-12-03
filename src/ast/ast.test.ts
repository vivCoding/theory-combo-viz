import { Ast, SORT } from "./ast"
import { add, Int, intval, mul } from "./theories/int"
import { and, Bool, neq } from "./theories/logic"
import { Set, elemof, set, single } from "./theories/set"
import { baseTheory, intTheory, purification, purifyAst, setTheory } from "../purification/theory"
import { freeconstants_map, UNIFY } from "./typecheck"

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
