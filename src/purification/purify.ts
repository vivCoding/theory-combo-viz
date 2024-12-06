import { Ast, ConstId, SORT } from "../ast/ast";
import { and, eq } from "../ast/theories/logic";
import { baseTheory, Theory } from "../theory/theory";
import { to_clauses } from "./utils";


function get_theory_single(theories: Theory[], value: any) : Theory {
  const result = theories.find(t => t.test_ast(value))
  if(!result) { throw new Error(`No theory found for ${value}`); }
  return result;
}

function get_theory_rec(theories: Theory[], ast: Ast) : Theory {
  const theory = get_theory_single(theories, ast.value);
  if (theory != baseTheory) { return theory; }
  for (const arg of ast.args || []) {
    const th = get_theory_rec(theories, arg)
    if(th != baseTheory) { return th; }
  }
  return baseTheory;
}


function purifyAstInner(theory: Theory, ast: Ast, result: Ast[]): Ast {
  if(theory.test_ast(ast.value) || baseTheory.test_ast(ast.value)) {
    ast.args = ast.args?.map(arg => purifyAstInner(theory, arg, result));
    return ast
  } else {
    const ty = ast.typecheck();
    if(ty === SORT) { throw new Error(); }
    const c = ty.constant('p$') as Ast;
    result.push(eq(ast, c));
    return c;
  }
}

export function purifyAst(theory: Theory, ast: Ast) : {purified: Ast, rest: Ast[]} {  
  var result: Ast[] = [];
  purifyAstInner(theory, ast, result);
  return { purified: ast, rest: result };
}

function purificationInner(theories: Theory[], ast: Ast, result: Ast[][]) {
  const theory = get_theory_rec(theories, ast);
  const theory_i = theories.indexOf(theory);
  if (theory_i == -1) { throw new Error(`Ast from Unknown Theory: ${ast}`); }

  const { purified, rest } = purifyAst(theory, ast);
  result[theory_i].push(purified);

  for (const a of rest) {
    purificationInner(theories, a, result);
  }
}

export function purificationClauses(theories: Theory[], ast: Ast) : Ast[][] {
  var result: Ast[][] = theories.map(() => []);
  for(const a of to_clauses(ast)) {
    purificationInner(theories, a, result);
  }
  return result;
}

export function purification(theories: Theory[], ast: Ast) : (Ast | null)[] {
  let result =  purificationClauses(theories, ast);
  return result.map((x) => x.length > 0 ? x.reduce((acc, x) => and(acc, x)) : null);
}