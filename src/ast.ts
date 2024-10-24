
export type OpFormatting = 
  { type: 'prefix', prec: number } |
  { type: 'infix', prec: number } |
  { type: 'suffix', prec: number } |
  { type: 'function', prec?: undefined}

export type TypeChecker = (opname: string, args: Ast[]) => Ast | 'sort';

export function basicOp(
    argtypes: (Ast | 'sort')[],
    rettype: Ast | 'sort',
) : TypeChecker {
  return (opname: string, args: Ast[]) => {
    if(args.length != argtypes.length) {
      throw new Error(`wrong number of arguments for ${opname}`);
    }
    for(let i = 0; i < args.length; i++) {
      if(args[i].typecheck(args[i].args || []) != argtypes[i]) {
          throw new Error("wrong type of argument " + i + ` for ${opname}`);
      }
    }
    return rettype;
  }
}

type Op = {name: string, fmt: (args: Ast[], prec?: number) => string, typecheck: (args: Ast[]) => Ast | 'sort'};

export function operator(
    name: string,
    tychk: TypeChecker,
    formatting: OpFormatting = { type: 'function' }
) : Op {
    return { name, 
      fmt: (args, prec?: number) => {
        prec = prec || 0;
        var result = "";
        switch(formatting.type) {
          case 'prefix':
            result = name + args.map(a => a.fmt(a.args || [], formatting.prec || prec)).join(' '); break;
          case 'infix':
            result = args.map(a => a.fmt(a.args || [], formatting.prec || prec)).join(' ' + name + ' '); break;
          case 'suffix':
            result = args.map(a => a.fmt(a.args || [], formatting.prec || prec)).join(' ') + name; break;
          case 'function':
            result = name + (args.length > 0? '(' + args.map(a => a.fmt(a.args || [], 0)).join(', ') + ')' : ""); break;
        }
        if (formatting.type != 'function' && prec > formatting.prec) {
          return '(' + result + ')';
        }
        return result
      },
      typecheck: (args) => { return tychk(name, args); }
    };
}

export function opfunc(
  name: string,
  tychk: TypeChecker,
  formatting: OpFormatting = { type: 'function' }
) {
  const op = operator(name, basicOp([], 'sort'), formatting);
  return (...args: Ast[]) => {
    return {...op, args};
  }
}


export type Ast = Op & {args?: Ast[]};

export function sort(name: string) {
  const op = operator(name, basicOp([], 'sort'))
  return {...op, constant: (name: string) => constant(op, name)};
}

export function constant(sort: Op, name: string = "") {
  if(name == '') { name = 'v' + Math.floor(Math.random() * 1000000).toString(16); }
  return operator(name, basicOp([], sort));
}
