import { ConstId } from "../ast/ast"

import type { Ast } from "../ast/ast"

export function to_clauses(ast: Ast): Ast[] {
  const result = [] as Ast[]

  function inner(ast: Ast) {
    if (ast.value == "and") {
      for (const arg of ast.args || []) {
        inner(arg)
      }
    } else {
      result.push(ast)
    }
  }
  inner(ast)
  return result
}

export function variables(ast: Ast): ConstId[] {
  const result = new Map<string, ConstId>()
  inner(ast)

  function inner(ast: Ast) {
    for (const arg of ast.args || []) {
      inner(arg)
    }
    if (ast.value instanceof ConstId) {
      result.set(ast.value.name, ast.value as ConstId)
    }
  }

  return result.values().toArray()
}
