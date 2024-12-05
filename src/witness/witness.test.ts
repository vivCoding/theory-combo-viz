import { add, Int, intval } from "../ast/theories/int"
import { eq, and, neq, Bool } from "../ast/theories/logic"
import { Set, set, single, elemof } from "../ast/theories/set"
import { setWitness } from "./witness"

test("basic", () => {
  const a = Int.constant("a")
  const b = Int.constant("b")
  const S = Set(Int).constant("S")
  const ast = and(neq(set(a, b), S), eq(set(a, b, add(a, b)), S), eq(b, intval(0)))
  expect(setWitness(ast).ast).not.toEqual(ast)
})
