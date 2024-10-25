import { Ast, ConstId, SORT } from "../ast/ast";
import { eq } from "../ast/theories/logic";
import { to_clauses } from "./utils";


export type Theory = {
  name: string,
  test_ast: (value: any) => boolean,
}

export const baseTheory = {
  name: "base",
  test_ast: (value: any) => {
    if (typeof value === "string") { 
      return ["and", "or", "not", "eq", "neq"].includes(value);
    } else {
      return value instanceof ConstId;
    }
  },
}

export const intTheory = {
  name: "int",
  test_ast: (value: any) => {
    if (typeof value === "string") { 
      return ["int.add", "int.neg", "int.sub", "int.mul", "int.div", "int.gt", "int.lt", "int.ge", "int.le"].includes(value);
    } else {
      return typeof value === "number";
    }
  },
}

export const setTheory = {
  name: "set",
  test_ast: (value: any) => {
    if (typeof value === "string") { 
      return ["set.union", "set.intersect", "set.single", "set.elemof"].includes(value);
    }
    return false;
  },
}


function get_theory(theories: Theory[], value: any) : Theory {
  const result = theories.find(t => t.test_ast(value))
  if(!result) { throw new Error(`No theory found for ${value}`); }
  return result;
}

function get_theory_rec(theories: Theory[], ast: Ast) : Theory {
  const theory = get_theory(theories, ast.value);
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

export function purification(theories: Theory[], ast: Ast) : Ast[][] {
  var result: Ast[][] = theories.map(() => []);
  for(const a of to_clauses(ast)) {
    purificationInner(theories, a, result);
  }
  return result;
}