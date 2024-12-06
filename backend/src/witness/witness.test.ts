import { setWitness } from "./witness"
import { Int, add, intval } from "../ast/theories/int"
import { Bool, and, eq, neq } from "../ast/theories/logic"
import { Set, elemof, set, single } from "../ast/theories/set"

test("basic", () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const ast = and(neq(set(a, b), S), eq(set(a, b, add(a, b)), S), eq(b, intval(0)))
  expect(setWitness(ast).ast).not.toEqual(ast)
})
