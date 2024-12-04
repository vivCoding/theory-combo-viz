import { Ast, ConstId } from "../ast/ast";

export type Theory = {
  name: string,
  test_ast: (value: any) => boolean,
  // solve: (ast: Ast) => {status: 'sat' | 'unsat' | 'unknown', model?: any},
}

export const baseTheory: Theory = {
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
      return ["set.union", "set.intersect", "set.single", "set.elemof", "set.diff", "set.empty"].includes(value);
    }
    return false;
  },
}

