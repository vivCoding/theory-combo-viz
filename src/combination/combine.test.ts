import { result } from "lodash"
import { Ast, SORT } from "../ast/ast"
import { add, Int, intval, mul } from "../ast/theories/int"
import { and, Bool, eq, implies, neq, not } from "../ast/theories/logic"
import { Set, diff, elemof, empty, intersect, set, single, subsetof, union } from "../ast/theories/set"
import { freeconstants_map, UNIFY } from "../ast/typecheck"

import { solve } from "../ast/z3convert"
import { intTheory, setTheory } from "../theory/theory"
import { combine, generate_classes_all_sorts, generate_eqclasses } from "./combine"

// test('generate eqclasses', () => {
//   console.log(generate_classes_all_sorts([1, 2, 3, 4, 5]).toArray().map((x) => x.join(" ")).join(", "))
// })

test("set example", async () => {
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
