import { Ast, ConstId, SortAst } from "./ast";

// Function to compare two objects, if they have an equals method, use it, otherwise use the == operator
export function EQ(a: any, b: any) {
  if (a.equals && b.equals) { return a.equals(b); }
  else { return a === b; }
}

// Function to unify two ASTs
export function UNIFY(a: Ast, b: Ast, constants: Map<ConstId, Ast | 'free'>) : boolean {
  if(a.value instanceof ConstId && constants.get(a.value)) {
    if(constants.get(a.value) === 'free') {
      constants.set(a.value, b);
      return true;
    }
    return UNIFY(constants.get(a.value) as Ast, b, constants);
  }
  if(b.value instanceof ConstId && constants.get(b.value)) {
    return UNIFY(b, a, constants);
  }
  if(EQ(a.value, b.value)) {
    if(a.args && b.args && a.args.length == b.args.length) {
      return a.args.every((a, i) => UNIFY(a, b.args![i], constants));
    } else { return !a.args && !b.args; }
  }
  return false;
}

// Replace Ast with variable map.
export function REPLACE(a: Ast, constants: Map<ConstId, Ast | 'free'>): Ast {
  if(a.value instanceof ConstId && constants.get(a.value)) {
    if(constants.get(a.value) === 'free') { throw new Error("unreplaced constant"); }
    return constants.get(a.value) as Ast;
  }
  if(a.args) {
    return {...a, args: a.args.map(a => REPLACE(a, constants))};
  }
  return a;
}

// Type checker function used by Op
export type TypeChecker = (opname: string, args: Ast[]) => SortAst;

export function freeconstants_map(freeconstants: ConstId[] = []) : Map<ConstId, Ast | 'free'> {
  const constants = new Map<ConstId, Ast | 'free'>();
  for (const free of freeconstants) {
    constants.set(free, 'free');
  }
  return constants
}

export function basicOp(
    argtypes: SortAst[],
    rettype: SortAst,
    freeconstants: Ast[] = [],
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    if(args.length != argtypes.length) {
      throw new Error(`wrong number of arguments for ${opname}`);
    }
    var constants = freeconstants_map(freeconstants.map(f => f.value as ConstId));
    for(let i = 0; i < args.length; i++) {
      if(!UNIFY(args[i].typecheck(), argtypes[i], constants)) {
          throw new Error("wrong type of argument " + i + ` for ${opname} : ${args[i].typecheck().fmt()}`);
      }
    }
    return REPLACE(rettype, constants) as SortAst;
  }
}

export function varargOp(
    argtype: SortAst,
    rettype: SortAst,
    freeconstants: Ast[] = [],
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    var constants = freeconstants_map(freeconstants.map(f => f.value as ConstId));
    for(let i = 0; i < args.length; i++) {
      if(!UNIFY(args[i].typecheck(), argtype, constants)) {
        throw new Error("wrong type of argument " + i + ` for ${opname} : ${args[i].typecheck().fmt()}`);
      }
    }
    return REPLACE(rettype, constants) as SortAst;
  }
}