
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
      if(argtypes[i] != 'any' && args[i].typecheck() != argtypes[i]) {
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

type Op = {name: string, fmt: (this: Ast, prec?: number) => string, typecheck: (this: Ast) => Ast | 'sort'};

export function operator(
    name: string,
    tychk: TypeChecker,
    formatting: OpFormatting = { type: 'function' }
) : Op {
    return { name, 
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
      typecheck: function (this) { return tychk(name, this.args || []); }
    };
}

export function opfunc(
  name: string,
  tychk: TypeChecker,
  formatting: OpFormatting = { type: 'function' }
) {
  const op = operator(name, tychk, formatting);
  return (...args: Ast[]) => {
    return {...op, args};
  }
}


export type Ast = Op & {args?: Ast[]};

export function sort(name: string, args: (Ast | 'sort')[] = []) {
  const op = operator(name, basicOp(args, 'sort'))
  return {...op, constant: (name: string) => constant(op, name)};
}

export function constant(sort: Op, name: string = "") {
  if(name == '') { name = 'v' + Math.floor(Math.random() * 1000000).toString(16); }
  return operator(name, basicOp([], sort));
}
