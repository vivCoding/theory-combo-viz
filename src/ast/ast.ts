
import { EQ, basicOp, TypeChecker } from "./typecheck"

// Formatting methods for the AST
export type OpFormatting =
  | { type: "prefix"; prec: number }
  | { type: "infix"; prec: number }
  | { type: "suffix"; prec: number }
  | { type: "function"; prec?: undefined }
  | { type: "bracket"; prec?: undefined }

// Type of a Operator, without any arguments
export type Op = {
  name: string // This is just a name for printing
  value: any // This is the actual value of the operator
  fmt: (this: Ast, prec?: number) => string // the formatting function
  typecheck: (this: Ast) => SortAst // the type checker function
  equals: (this: Ast, other: Ast) => boolean // the equality function
}

// This is the type of an AST node, tricky typescript technique.
export type Ast = Op & { args?: Ast[] }

// This Ast is also used to represent Sort. Since sometimes sort is an expression.
export type SortAst = Ast & { args?: Ast[]; constant: (this: SortAst, name: string) => Op }

// This is the function to create an `Op`
export function operator(name: string, value: any, tychk: TypeChecker, formatting: OpFormatting = { type: "function" }): Op {
  return {
    name,
    value,
    fmt: function (this: Ast, prec?: number) {
      const args = this.args || []
      prec = prec || 0
      var result = ""
      switch (formatting.type) {
        case "prefix":
          result = name + args.map((a) => a.fmt(formatting.prec || prec)).join(" ")
          break
        case "infix":
          result = args.map((a) => a.fmt(formatting.prec || prec)).join(" " + name + " ")
          break
        case "suffix":
          result = args.map((a) => a.fmt(formatting.prec || prec)).join(" ") + name
          break
        case "function":
          result = name + (args.length > 0 ? "(" + args.map((a) => a.fmt(0)).join(", ") + ")" : "")
          break
        case "bracket":
          result = name.split("$")[0] + args.map((a) => a.fmt(0)).join(", ") + name.split("$")[1]
          break
      }
      if (formatting.prec && prec > formatting.prec) {
        return "(" + result + ")"
      }
      return result
    },
    typecheck: function (this) {
      return tychk(name, this.args || [])
    },
    equals: function (this, that) {
      if (!("name" in that)) {
        return false
      }
      if (this.name != that.name) {
        return false
      }
      if (this.value && that.value && !EQ(this.value, that.value)) {
        return false
      }
      const thisargs = this.args || []
      const thatargs = that.args || []
      return thisargs.length == thatargs.length && thisargs.every((a, i) => a.equals(thatargs[i]))
    },
  }
}

// This will create an `Op` and then return a function to create an Ast
export function opfunc(name: string, value: any, tychk: TypeChecker, formatting: OpFormatting = { type: "function" }) {
  const op = operator(name, value, tychk, formatting)
  return (...args: Ast[]) => {
    return { ...op, args }
  }
}

// Use class as identififer. `==` will compare the reference.
export class SortId {
  constructor(public name: string) {}
}

// Create a sort
export function sort(name: string): SortAst {
  const op = operator(name, new SortId(name), basicOp([], SORT))
  return {
    ...op,
    constant: function (this, name) {
      return constant(this, name)
    },
  }
}

// Sort for all sorts
export const SORT = {
  ...operator("SORT", new SortId("SORT"), basicOp([], null as unknown as SortAst)),
  constant: function (this: SortAst, name: string) {
    return constant(this, name) as unknown as SortAst
  },
}

// Create a sort that can create new sorts.
export function sortfunc(name: string, args: SortAst[] = []): (...args: Ast[]) => SortAst {
  const op = operator(name, new SortId(name), basicOp(args, SORT))
  const sort: SortAst = {
    ...op,
    constant: function (this, name) {
      return constant(this, name)
    },
  }
  return (...args: Ast[]) => {
    return { ...sort, args }
  }
}

// Use class as identififer. `==` will compare the reference.
export class ConstId {
  constructor(public name: string, public sort: SortAst) {}
  equals(that: ConstId) {
    if(this.name == that.name && !this.sort.equals(that.sort)) {
      throw new Error(`ConstId ${this.name} has different sorts`);
    }
    return this.name == that.name;
  }
  as_ast() {
    return operator(this.name, this, basicOp([], this.sort), { type: 'function' });
  }
}

// Create a constant (actually a variable in `def-var`, but everybody is calling this 'constant')
var counter = new Map<string, number>()
export function constant(sort: SortAst, name: string) {
  if (name.includes("$")) {
    const id = counter.get(name) || 0
    counter.set(name, id + 1)
    name = name.replace("$", toSubscript(id))
  }
  return new ConstId(name, sort).as_ast();
}

function toSubscript(num: number) {
  const subscriptNumbers = "₀₁₂₃₄₅₆₇₈₉";
  return num.toString().split('').map(digit => subscriptNumbers[parseInt(digit)]).join('');
}
