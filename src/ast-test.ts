import { Ast } from "./ast/ast"
import { add, Int, intval, mul } from "./ast/theories/int"
import { neq } from "./ast/theories/logic"
import { set, single } from "./ast/theories/set"

const ast = neq(set(add(intval(1), intval(10)), intval(11)), single(Int.constant("a")))

console.log(ast.fmt())
console.log((ast.typecheck() as unknown as Ast).fmt())

// {1 + 10} | {11} != {a}
// Bool
