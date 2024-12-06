import { result } from "lodash"
import { combine } from "./combination/combine"
import { parseToAst } from "./parsing"
import { setTheory, intTheory } from "./theory/theory"
import { writeFileSync } from "fs"

// type Step = {
//   type: "purification",
// }

// function extractSteps(step)

test("thing", async () => {
  // const input = "x == {3 + 5, 1} /\\ 8 ∈ x /\\ 2 - 1 ∉ x"
  // const input = "x == {3 + 5, 1} ∧ 8 ∈ x ∧ 2 - 1 ∉ x"
  // const input = "x == {3 + 5, 1} /\\ 8 ∈ x /\\ 2 - 1 ∈ x"
  // const input = "x != y ∧ 1 ∈ x ∧ 2 ∈ y ∧ x ∩ y == ∅"
  const input = "x != ∅ ∧ y != ∅ ∧ 1 ∈ x ∧ 1 ∈ y"
  const ast = parseToAst(input)
  const solver = combine(setTheory, intTheory)
  const result = await solver(ast)
  console.log("final", result.status)
  writeFileSync("output.json", JSON.stringify(result.steps ?? [], null, 2))
  expect(true).toStrictEqual(true)
}, 60000)
