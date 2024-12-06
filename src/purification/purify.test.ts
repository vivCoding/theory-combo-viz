import { purification } from "./purify"
import { Int, add, intval } from "../ast/theories/int"
import { Bool, and, eq, neq } from "../ast/theories/logic"
import { Set, elemof, set, single } from "../ast/theories/set"
import { baseTheory, intTheory, setTheory } from "../theory/theory"

test("basic", () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const ast = and(eq(set(a, b, add(a, b)), S), neq(set(a, b), S), eq(b, intval(0)))
  const p = purification([baseTheory, intTheory, setTheory], ast)
  for (const th of p) {
    console.log(th ? th.fmt() : "null")
  }
})
