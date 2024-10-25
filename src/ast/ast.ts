
// Function to compare two objects, if they have an equals method, use it, otherwise use the == operator
export function EQ(a: any, b: any) {
  if (a.equals && b.equals) { return a.equals(b); }
  else { return a === b; }
}

// Formatting methods for the AST
export type OpFormatting = 
  { type: 'prefix', prec: number } |
  { type: 'infix', prec: number } |
  { type: 'suffix', prec: number } |
  { type: 'function', prec?: undefined} |
  { type: 'bracket', prec?: undefined};

// Type checker function used by Op
export type TypeChecker = (opname: string, args: Ast[]) => SortAst | 'sort';

export function basicOp(
    argtypes: (SortAst | 'sort' | 'any')[],
    rettype: SortAst | 'sort',
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    if(args.length != argtypes.length) {
      throw new Error(`wrong number of arguments for ${opname}`);
    }
    for(let i = 0; i < args.length; i++) {
      if(argtypes[i] != 'any' && EQ(args[i].typecheck(), argtypes[i])) {
          throw new Error("wrong type of argument " + i + ` for ${opname}`);
      }
    }
    return rettype;
  }
}

export function varargOp(
    argtype: SortAst | 'sort' | 'any',
    rettype: SortAst | 'sort',
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    for(let i = 0; i < args.length; i++) {
      if(argtype != 'any' && args[i].typecheck() != argtype) {
          throw new Error("wrong type of argument " + i + ` for ${opname}`);
      }
    }
    return rettype;
  }
}

// Type of a Operator, without any arguments
export type Op = {
  name: string, // This is just a name for printing
  value: any, // This is the actual value of the operator
  fmt: (this: Ast, prec?: number) => string, // the formatting function
  typecheck: (this: Ast) => SortAst | 'sort', // the type checker function
  equals: (this: Ast, other: Ast) => boolean, // the equality function
};

// This is the type of an AST node, tricky typescript technique.
export type Ast = Op & {args?: Ast[]};

// This Ast is also used to represent Sort. Since sometimes sort is an expression.
export type SortAst = Ast & { args?: SortAst[], constant: (this: SortAst, name: string) => Op };

// This is the function to create an `Op`
export function operator(
    name: string,
    value: any,
    tychk: TypeChecker,
    formatting: OpFormatting = { type: 'function' },
) : Op {
    return { name, value,
      fmt: function(this: Ast, prec?: number) {
        const args = this.args || [];
        prec = prec || 0;
        var result = "";
        switch(formatting.type) {
          case 'prefix':
            result = name + args.map(a => a.fmt(formatting.prec || prec)).join(' '); break;
          case 'infix':
            result = args.map(a => a.fmt(formatting.prec || prec)).join(' ' + name + ' '); break;
          case 'suffix':
            result = args.map(a => a.fmt(formatting.prec || prec)).join(' ') + name; break;
          case 'function':
            result = name + (args.length > 0? '(' + args.map(a => a.fmt(0)).join(', ') + ')' : ""); break;
          case 'bracket':
            result = name.split('$')[0] + args.map(a => a.fmt(0)).join(', ') + name.split('$')[1]; break;
        }
        if (formatting.prec && prec > formatting.prec) {
          return '(' + result + ')';
        }
        return result
      },
      typecheck: function (this) { return tychk(name, this.args || []); },
      equals: function (this, that) {
        if(!('name' in that)) { return false; }
        if(this.name != that.name) { return false; }
        if(this.value && that.value && !EQ(this.value, that.value)) { return false; }
        const thisargs = this.args || [];
        const thatargs = that.args || [];
        return  thisargs.length == thatargs.length && thisargs.every((a, i) => a.equals(thatargs[i]));
      },
    };
}

// This will create an `Op` and then return a function to create an Ast
export function opfunc(
  name: string,
  value: any,
  tychk: TypeChecker,
  formatting: OpFormatting = { type: 'function' }
) {
  const op = operator(name, value, tychk, formatting);
  return (...args: Ast[]) => {
    return {...op, args};
  }
}

// Use class as identififer. `==` will compare the reference.
export class SortId {
  constructor(public name: string) {}
}

// Create a sort
export function sort(name: string, args: (SortAst | 'sort')[] = []) : SortAst {
  const op = operator(name, new SortId(name), basicOp(args, 'sort'))
  return {...op, constant: function(this, name) { return constant(this, name) } };
}

// Use class as identififer. `==` will compare the reference.
export class ConstId {
  constructor(public name: string) {}
}

// Create a constant (actually a variable in `def-var`, but everybody is calling this 'constant')
export function constant(sort: SortAst, name: string = "") {
  if(name == '') { name = 'v' + Math.floor(Math.random() * 1000000).toString(16); }
  return operator(name, new ConstId(name), basicOp([], sort), { type: 'function' });
}
