import _ from 'lodash';
import { Arr, select } from '../ast/theories/array';
import { eq, neq, not } from '../ast/theories/logic';

import { SORT, SortId } from "../ast/ast"
import { Set, diff, elemof, union } from "../ast/theories/set"
import { REPLACE, UNIFY, freeconstants_map } from "../ast/typecheck"

import type { Ast, ConstId, SortAst } from "../ast/ast"
export type WitnessFunc = (ast: Ast) => Ast

function setWitnessInner(ast: Ast, vars: ConstId[], isnegation: boolean = false): Ast {
  ast = _.cloneDeep(ast)
  if (ast.value === "not") {
    ast.args = [setWitnessInner(ast.args![0], vars, !isnegation)]
  } else if (ast.value === "implies") {
    ast.args = [setWitnessInner(ast.args![0], vars, !isnegation), setWitnessInner(ast.args![1], vars, isnegation)]
  } else {
    ast.args = ast.args?.map((x) => setWitnessInner(x, vars, isnegation))
  }
  if ((isnegation && ast.value === "eq") || (!isnegation && ast.value === "neq")) {
    const _a = SORT.constant("'a")
    const constants = freeconstants_map([_a])
    if(UNIFY(ast.args![0].typecheck(), Set(_a), constants)) {
      const ty = REPLACE(_a, constants) as SortAst;
      const c_e = ty.constant('__e$');
      vars.push(c_e.value);
      const result = elemof(c_e, union(diff(ast.args![0], ast.args![1]), diff(ast.args![1], ast.args![0])));
      return isnegation ? not(result) : result;
    }
  }
  return ast
}

export function setWitness(ast: Ast): { ast: Ast; vars: ConstId[] } {
  const vars: ConstId[] = []
  return {
    ast: setWitnessInner(ast, vars),
    vars,
  }
}


function arrayWitnessInner(ast: Ast, vars: ConstId[], isnegation: boolean=false): Ast {
  ast = _.cloneDeep(ast);
  if(ast.value === "not") {
    ast.args = [setWitnessInner(ast.args![0], vars, !isnegation)];
  } else if(ast.value === "implies") {
    ast.args = [setWitnessInner(ast.args![0], vars, !isnegation), setWitnessInner(ast.args![1], vars, isnegation)];
  } else {
    ast.args = ast.args?.map((x) => setWitnessInner(x, vars, isnegation));
  }
  if(isnegation && ast.value === "eq" || !isnegation && ast.value === "neq") {
    const _a = SORT.constant("'a")
    const constants = freeconstants_map([_a])
    if(UNIFY(ast.args![0].typecheck(), Arr(_a), constants)) {
      const ty = REPLACE(_a, constants) as SortAst;
      const c_i = ty.constant('__i$');
      vars.push(c_i.value);
      const result = (isnegation ? eq : neq)(select(ast.args![0], c_i), select(ast.args![0], c_i));
      return result;
    }
  }
  return ast;
}

export function arrayWitness(ast: Ast): {ast: Ast, vars: ConstId[]} {
  var vars: ConstId[] = Array();
  return {
    ast: setWitnessInner(ast, vars),
    vars
  }
}
