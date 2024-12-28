"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parsing_1 = require("./parsing");
// type Step = {
//   type: "purification",
// }
// function extractSteps(step)
test("thing", async () => {
    // const input = "x == {3 + 5, 1} ∧ 8 ∈ x ∧ 2 - 1 ∉ x"
    // const input = "x != y ∧ 1 ∈ x ∧ 2 ∈ y ∧ x ∩ y == ∅"
    // const input = "x != ∅ ∧ y != ∅ ∧ 1 ∈ x ∧ 1 ∈ y"
    const input = "x != ∅ ∧ y != ∅ ∧ x ∪ y == ∅ ∧ 1 ∉ x";
    (0, parsing_1.getVarsAndInferredTypes)(input);
    // const ast = parseToAst(input)
    // const solver = combine(setTheory, intTheory)
    // const result = await solver(ast)
    // console.log("final", result.status)
    // writeFileSync("output.json", JSON.stringify(result.steps ?? [], null, 2))
    expect(true).toStrictEqual(true);
}, 60000);
