import { Ast, ConstId, SORT, SortAst, SortId } from "../ast/ast";
import { diff, elemof, Set, union } from "../ast/theories/set";
import _ from 'lodash';
import { freeconstants_map, REPLACE, UNIFY } from "../ast/typecheck";
export type WitnessFunc = (ast: Ast) => Ast;

function setWitnessInner(ast: Ast, vars: ConstId[]): Ast {
  ast = _.cloneDeep(ast);
  ast.args = ast.args?.map((x) => setWitnessInner(x, vars));
  if(ast.value === "neq") {
    const _a = SORT.constant("'a")
    const constants = freeconstants_map([_a])
    if(UNIFY(ast.args![0].typecheck(), Set(_a), constants)) {
      const ty = REPLACE(_a, constants) as SortAst;
      const c_e = ty.constant('__e$');
      vars.push(c_e.value);
      return elemof(c_e, union(diff(ast.args![0], ast.args![1]), diff(ast.args![1], ast.args![0])));
    }
  }
  return ast;
}

export function setWitness(ast: Ast): {ast: Ast, vars: ConstId[]} {
  var vars: ConstId[] = Array();
  return {
    ast: setWitnessInner(ast, vars),
    vars
  }
}


