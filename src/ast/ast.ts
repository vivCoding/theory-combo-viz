
export type OpFormatting = 
  { type: 'prefix', prec: number } |
  { type: 'infix', prec: number } |
  { type: 'suffix', prec: number } |
  { type: 'function', prec?: undefined} |
  { type: 'bracket', prec?: undefined};

export type TypeChecker = (opname: string, args: Ast[]) => Ast | 'sort';

export function basicOp(
    argtypes: (Ast | 'sort' | 'any')[],
    rettype: Ast | 'sort',
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    if(args.length != argtypes.length) {
      throw new Error(`wrong number of arguments for ${opname}`);
    }
    for(let i = 0; i < args.length; i++) {
      if(argtypes[i] != 'any' && eq(args[i].typecheck(), argtypes[i])) {
          throw new Error("wrong type of argument " + i + ` for ${opname}`);
      }
    }
    return rettype;
  }
}

export function varargOp(
    argtype: Ast | 'sort' | 'any',
    rettype: Ast | 'sort',
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

export type Op = {name: string, value: any,
  fmt: (this: Ast, prec?: number) => string, typecheck: (this: Ast) => Ast | 'sort',
  equals: (this: Ast, other: Ast) => boolean,
};

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
        if(this.value && that.value && !eq(this.value, that.value)) { return false; }
        const thisargs = this.args || [];
        const thatargs = that.args || [];
        return  thisargs.length == thatargs.length && thisargs.every((a, i) => a.equals(thatargs[i]));
      },
    };
}

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


export type Ast = Op & {args?: Ast[]};

export class SortId {
  constructor(public name: string) {}
}

export function sort(name: string, args: (Ast | 'sort')[] = []) {
  const op = operator(name, new SortId(name), basicOp(args, 'sort'))
  return {...op, constant: (name: string) => constant(op, name)};
}

export class ConstId {
  constructor(public name: string) {}
}

export function constant(sort: Op, name: string = "") {
  if(name == '') { name = 'v' + Math.floor(Math.random() * 1000000).toString(16); }
  return operator(name, new ConstId(name), basicOp([], sort), { type: 'function' });
}

export function eq(a: any, b: any) {
  if (a.equals && b.equals) { return a.equals(b); }
  else { return a == b; }
}