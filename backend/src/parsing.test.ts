import { parseToAst } from "./parsing"

test("basic", () => {
  expect(true).toEqual(true)
})

// const input = "(x1 + 2 * 3) * 3 != 2"
// const input = "(x > y) /\\ y == z"
// const input = "!x /\\ (x1 == 3 \\/ x1 > 3 \\/ (x1 + 2 * 3) * 3 != 2) /\\ x1 != y2"
// const input = "-3 + 2 > 1 /\\ 1 + 2 == 3"

// const input = "x != y /\\ (x == {1, 2, 3} | {4, 5, 5} \\/ 3 + 2 > 1)"
// const input = "x != y /\\ (x == {1, 2, 3} & {4, 5, 5} \\/ 3 + 2 > 1) /\\ a ∈ x /\\ x == ∅"
// const input = "x != y /\\ (1 == 2 + -1 \\/ 3 + 2 > 1 \\/ a \\/ b) /\\ a ∈ x /\\ x == ∅"
// const input = "(1 == 2 + -1 \\/ 3 + 2 > 1 \\/ a \\/ b) /\\ a ∈ x /\\ x == ∅ /\\ b ∈ x"
// const input = "a == 1 /\\ a ∈ x /\\ x == ∅"
// const input = "x == {1, 2, 3} | {4, 5, y} /\\ a != x"
// const input = "x == {a, b, c} /\\ c == 1"
// const input = "x == ∅ /\ 1 ∈ x /\ 2∉y"

// const input = "a[x] == 1 /\\ x == 2"
// const input = "a[1 -> x] == y /\\ x == 5 + 3"
// const input = "a[1 + 2 -> x] == y /\\ x == 5 + 3"
// const input = "a[1 -> x] == a[x -> 1]"
// console.log(parseMain(input).fmt())
// console.log(parseMain(input).typecheck())
