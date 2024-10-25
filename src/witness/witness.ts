import { Ast, SORT, SortAst, SortId } from "../ast/ast";
import { diff, elemof, Set, union } from "../ast/theories/set";
import _ from 'lodash';
import { freeconstants_map, REPLACE, UNIFY } from "../ast/typecheck";
export type WitnessFunc = (ast: Ast) => Ast;

export function setWitness(ast: Ast): Ast {
  ast = _.cloneDeep(ast);
  ast.args = ast.args?.map(setWitness);
  if(ast.value === "neq") {
    const _a = SORT.constant("'a")
    const constants = freeconstants_map([_a])
    if(UNIFY(ast.args![0].typecheck(), Set(_a), constants)) {
      const ty = REPLACE(_a, constants) as SortAst;
      const c_e = ty.constant('e$');
      return elemof(c_e, union(diff(ast.args![0], ast.args![1]), diff(ast.args![1], ast.args![0])));
    }
  }
  return ast;
}


