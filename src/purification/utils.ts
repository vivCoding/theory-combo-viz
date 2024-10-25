import { Ast, ConstId } from "../ast/ast";


export function to_clauses(ast: Ast) : Ast[] {
  var result = [] as Ast[];

  function inner(ast: Ast) {
    if(ast.value == "and") {
      for (const arg of ast.args || []) {
        inner(arg);
      }
    } else { result.push(ast); }
  }
  inner(ast);
  return result;
}

export function variables(ast: Ast) : ConstId[] {
  var result = [] as ConstId[];
  inner(ast);

  function inner(ast: Ast) {
    for (const arg of ast.args || []) {
      inner(arg);
    }
    if (ast.value instanceof ConstId) {
      result.push(ast.value as ConstId);
    }
  }

  return result;
}
