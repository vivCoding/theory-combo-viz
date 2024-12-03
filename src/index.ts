// const result = purification([baseTheory, intTheory, setTheory], ast)

// for (const th of result) {
//   for (const a of th) {
//     console.log(a.fmt())
//   }
//   console.log("-----")
// }
import { Grammar, Parser } from "nearley"
import grammar from "./grammar.js"
import { writeFileSync } from "fs"
import { Int, add, div, ge, gt, intval, le, lt, mul, neg, sub } from "./ast/theories/int.js"
import { Bool, and, eq, neq, not, or } from "./ast/theories/logic.js"
import { Set, elemof, empty, intersect, set, union } from "./ast/theories/set.js"
import { Ast } from "./ast/ast.js"

const parser = new Parser(Grammar.fromCompiled(grammar))

function flattenConjuntDisjunct(data: any): any {
  if (data.type === "conjunct" || data.type === "disjunct") {
    const newPreds = []
    for (const pred of data.preds) {
      const newPred = flattenConjuntDisjunct(pred)
      if ((pred.type === "conjunct" && data.type == "conjunct") || (pred.type == "disjunct" && data.type == "disjunct")) {
        newPreds.push(...newPred.preds)
      } else {
        newPreds.push(newPred)
      }
    }
    data.preds = newPreds
  }
  return data
}

type Type = string
function CType(t: string, ...args: string[]) {
  return [t, ...args].join("_")
}
function getParentType(t: Type) {
  return t.split("_")[0]
}
function getChildrenType(t: Type) {
  return t.split("_")[1]
}
const Types = {
  Int: CType("Int"),
  Bool: CType("Bool"),
  Unknown: CType("Unknown"),
  Set: CType("Set"),
  SetEmpty: CType("Unknown"),
}

var varMap: Record<string, { type: Type }> = {}
var setEmptyVarsCt = 0

function createSetEmptyVars(data: any) {
  // console.log(varMap)
  switch (data.type) {
    case "arithOp":
      return data
    case "const":
      return data
    case "var":
      return data
    case "mathCompOp":
      data.left = createSetEmptyVars(data.left)
      data.right = createSetEmptyVars(data.right)
      return data
    case "not":
      return data
    case "logicCompOp":
      data.left = createSetEmptyVars(data.left)
      data.right = createSetEmptyVars(data.right)
      return data
    case "set":
      return data
    case "setOp":
      return data
    case "setCompOp":
      data.left = createSetEmptyVars(data.left)
      data.right = createSetEmptyVars(data.right)
      return data
    case "setElemOp":
      data.left = createSetEmptyVars(data.left)
      data.right = createSetEmptyVars(data.right)
      return data
    case "setEmpty":
      return {
        type: "var",
        name: `__SET_EMPTY_VAR_${setEmptyVarsCt++}`,
      }
    case "pred":
      data.value = createSetEmptyVars(data.value)
      return data
    case "disjunct":
      const newPreds = []
      for (const elem of data.preds) {
        newPreds.push(createSetEmptyVars(elem))
      }
      data.preds = newPreds
      return data
    case "conjunct":
      const newPreds2 = []
      for (const elem of data.preds) {
        newPreds2.push(createSetEmptyVars(elem))
      }
      data.preds = newPreds2
      return data
    default:
      console.log("YIKES this shouldn't have happened", data)
      throw "YIKES this shouldn't have happened" + data
    // return Types.Unknown
  }
}

function typeinferVars(data: any) {
  // console.log(varMap)
  switch (data.type) {
    case "arithOp":
      const leftType = typeinferVars(data.left)
      const rightType = typeinferVars(data.right)
      if (leftType !== Types.Unknown && leftType !== Types.Int) throw "bad type arith"
      if (rightType !== Types.Unknown && rightType !== Types.Int) throw "bad type arith"
      // both operands must be int
      if (data.left.type === "var") {
        varMap[data.left.name].type = Types.Int
      }
      if (data.right.type === "var") {
        varMap[data.right.name].type = Types.Int
      }
      return Types.Int
    case "const":
      return Types.Int
    case "var":
      if (!varMap.hasOwnProperty(data.name)) {
        varMap[data.name] = {
          type: Types.Unknown,
        }
      }
      return varMap[data.name].type
    case "mathCompOp":
      const mcl = typeinferVars(data.left)
      const mcr = typeinferVars(data.right)
      if (data.op == "==" || data.op == "!=") {
        // equality is ambiguous. It can either be math, logic, or sets
        if (data.left.type == "var" && data.right.type == "var") {
          if (mcl != Types.Unknown || mcr != Types.Unknown) {
            // if we know one of them, we can assign both of them
            varMap[data.left.name].type = mcl == Types.Unknown ? mcr : mcl
            varMap[data.right.name].type = mcl == Types.Unknown ? mcr : mcl
          } else {
            // if both unknown, leave them as unknown
          }
        } else {
          if (data.left.type === "var" && mcl === Types.Unknown) {
            varMap[data.left.name].type = mcr
          }
          if (data.right.type === "var" && mcr === Types.Unknown) {
            varMap[data.right.name].type = mcl
          }
        }
      } else {
        // for any other math op, the variables have to be int
        if (mcl !== Types.Unknown && mcl !== Types.Int) throw "bad type mathCompOp"
        if (mcr !== Types.Unknown && mcr !== Types.Int) throw "bad type mathCompOp"
        if (data.left.type === "var") {
          varMap[data.left.name].type = Types.Int
        }
        if (data.right.type === "var") {
          varMap[data.right.name].type = Types.Int
        }
      }
      return Types.Bool
    case "not":
      const notValType = typeinferVars(data.value)
      if (notValType !== Types.Unknown && notValType !== Types.Bool) {
        throw "bad type not"
      }
      if (notValType === Types.Unknown) {
        varMap[data.value.name].type = Types.Bool
      }
      return Types.Bool
    case "logicCompOp":
      const lcl = typeinferVars(data.left)
      const lcr = typeinferVars(data.right)
      if (lcl !== Types.Unknown && lcr !== Types.Unknown && lcl !== lcr) throw "bad type logicCompOp"
      // equality is ambiguous. It can either be math, logic, or sets
      if (data.left.type == "var" && data.right.type == "var") {
        if (lcl !== Types.Unknown || lcr !== Types.Unknown) {
          // if we know one of them, we can assign both of them
          varMap[data.left.name].type = lcl == Types.Unknown ? lcr : lcl
          varMap[data.right.name].type = lcl == Types.Unknown ? lcr : lcl
        } else {
          // if both unknown, leave them as unknown
        }
      } else {
        if (data.left.type === "var" && lcl === Types.Unknown) {
          varMap[data.left.name].type = lcr
        }
        if (data.right.type === "var" && lcr === Types.Unknown) {
          varMap[data.right.name].type = lcl
        }
      }
      return Types.Bool
    case "set":
      let currType = Types.Unknown
      const vars = []
      for (const elem of data.data) {
        const elemType = typeinferVars(elem)
        if (elem.type == "var" && elemType == Types.Unknown) {
          vars.push(elem)
        } else {
          if (currType !== Types.Unknown && elemType !== currType) {
            throw "bad type set"
          }
          currType = typeinferVars(elem)
        }
      }
      for (const v of vars) {
        varMap[v.name].type = currType
      }
      return CType(Types.Set, currType)
    case "setOp":
      const sl: Type = typeinferVars(data.left)
      const sr: Type = typeinferVars(data.right)
      if (sl !== Types.Unknown && getParentType(sl) !== Types.Set) throw "bad type setOp"
      if (sr !== Types.Unknown && getParentType(sr) !== Types.Set) throw "bad type setOp"
      const csl = getChildrenType(sl)
      const csr = getChildrenType(sr)
      if (csl !== Types.Unknown && csr !== Types.Unknown && csl !== csr) throw "bad type setOp"

      if (sl !== Types.Unknown || sr !== Types.Unknown) {
        if (data.left.type === "var") {
          varMap[data.left.name].type = sl === Types.Unknown ? sr : sl
        }
        if (data.right.type === "var") {
          varMap[data.right.name].type = sl === Types.Unknown ? sr : sl
        }
      }
      if (csl !== Types.Unknown || csr !== Types.Unknown) {
        if (data.left.type === "var") {
          varMap[data.left.name].type = csl === Types.Unknown ? csr : csl
        }
        if (data.right.type === "var") {
          varMap[data.right.name].type = csl === Types.Unknown ? csr : csl
        }
      }
      return CType(Types.Set, csl === Types.Unknown ? csr : csl)
    case "setCompOp":
      const scl = typeinferVars(data.left)
      const scr = typeinferVars(data.right)
      if (scl !== Types.Unknown && getParentType(scl) !== Types.Set) throw "bad type setCompOp"
      if (scr !== Types.Unknown && getParentType(scr) !== Types.Set) throw "bad type setCompOp"
      // equality is ambiguous. It can either be math, logic, or sets
      if (data.left.type == "var" && data.right.type == "var") {
        if (scl === Types.Unknown && scr !== Types.Unknown) {
          varMap[data.left.name].type = scr
        } else if (scl !== Types.Unknown && scr === Types.Unknown) {
          varMap[data.right.name].type = scl
        } else {
          // if both unknown, leave them as unknown
        }
      } else {
        if (data.left.type == "var" && scl === Types.Unknown) {
          varMap[data.left.name].type = scr
        }
        if (data.right.type == "var" && scr === Types.Unknown) {
          varMap[data.right.name].type = scl
        }
      }
      return Types.Bool
    case "setElemOp":
      const sel = typeinferVars(data.left)
      let ser = typeinferVars(data.right)
      if (ser !== Types.Unknown && getParentType(ser) !== Types.Set) throw "bad type setElemOp"
      if (data.right.type === "var") {
        if (ser === Types.Unknown) {
          varMap[data.right.name].type = CType(Types.Set, Types.Unknown)
          ser = CType(Types.Set, Types.Unknown)
        }
      }
      const cser = getChildrenType(ser)
      if (sel !== Types.Unknown) {
        if (cser === Types.Unknown) {
          varMap[data.right.name].type = CType(Types.Set, sel)
        } else if (sel !== cser) {
          throw `bad type setElemOp`
        }
      } else {
        if (cser !== Types.Unknown) {
          varMap[data.left.name].type = cser
        } else {
          // we still don't know
        }
      }
      return Types.Bool
    case "setEmpty":
      throw "shouldn't happen, all setEmpty should be gone"
    case "pred":
      const pval: Type = typeinferVars(data.value)
      if (data.value.type === "var" && pval !== Types.Bool) {
        if (pval === Types.Unknown) {
          varMap[data.value.name].type = Types.Bool
        } else {
          throw `bad type pred, pred ${data.value.name}`
        }
      }
      return Types.Bool
    case "disjunct":
      for (const elem of data.preds) {
        typeinferVars(elem)
      }
      return Types.Bool
    case "conjunct":
      for (const elem of data.preds) {
        typeinferVars(elem)
      }
      return Types.Bool
    default:
      console.log("YIKES this shouldn't have happened", data)
      throw "YIKES this shouldn't have happened" + data
    // return Types.Unknown
  }
}

function remakeParseTree(data: any) {
  // console.log(varMap)
  switch (data.type) {
    case "arithOp":
      return data
    case "const":
      return data
    case "var":
      return data
    case "mathCompOp":
      const mcl = typeinferVars(data.left)
      const mcr = typeinferVars(data.right)
      if (data.op == "==" || data.op == "!=") {
        if (mcl === Types.Int && mcr === Types.Int) {
          data.type = "mathCompOp"
          return data
        } else if (mcl === Types.Bool && mcr === Types.Bool) {
          data.type = "logicCompOp"
          return data
        } else if (getParentType(mcl) === Types.Set && getParentType(mcr) === Types.Set) {
          data.type = "setCompOp"
          return data
        } else {
          throw "idk what to do here"
        }
      }
      return data
    case "not":
      return data
    case "logicCompOp":
      const lcl = typeinferVars(data.left)
      const lcr = typeinferVars(data.right)
      if (data.op == "==" || data.op == "!=") {
        if (lcl === Types.Int && lcr === Types.Int) {
          data.type = "mathCompOp"
          return data
        } else if (lcl === Types.Bool && lcr === Types.Bool) {
          data.type = "logicCompOp"
          return data
        } else if (getParentType(lcl) === Types.Set && getParentType(lcr) === Types.Set) {
          data.type = "setCompOp"
          return data
        } else {
          throw "idk what to do here"
        }
      }
      return data
    case "set":
      return data
    case "setOp":
      return data
    case "setCompOp":
      const scl = typeinferVars(data.left)
      const scr = typeinferVars(data.right)
      if (data.op == "==" || data.op == "!=") {
        if (scl === Types.Int && scr === Types.Int) {
          data.type = "mathCompOp"
          return data
        } else if (scl === Types.Bool && scr === Types.Bool) {
          data.type = "logicCompOp"
          return data
        } else if (getParentType(scl) === Types.Set && getParentType(scr) === Types.Set) {
          data.type = "setCompOp"
          return data
        } else {
          throw "idk what to do here"
        }
      }
      return data
    case "setElemOp":
      return data
    case "setEmpty":
      return CType(Types.Set, Types.Unknown)
    case "pred":
      data.value = remakeParseTree(data.value)
      return data
    case "disjunct":
      const newPreds = []
      for (const elem of data.preds) {
        newPreds.push(remakeParseTree(elem))
      }
      data.preds = newPreds
      return data
    case "conjunct":
      const newPreds2 = []
      for (const elem of data.preds) {
        newPreds2.push(remakeParseTree(elem))
      }
      data.preds = newPreds2
      return data
    default:
      console.log("YIKES this shouldn't have happened", data)
      throw "YIKES this shouldn't have happened" + data
    // return Types.Unknown
  }
}

function createAst(data: any) {
  switch (data.type) {
    case "arithOp":
      const left: Ast = createAst(data.left)
      const right: Ast = createAst(data.right)
      switch (data.op) {
        case "+":
          return add(left, right)
        case "-":
          return sub(left, right)
        case "*":
          return mul(left, right)
        case "/":
          return div(left, right)
        default:
          throw "YIKES this shouldn't have happened " + data.type + " " + data.op
      }
    case "const":
      return intval(data.value)
    case "var":
      const vType = varMap[data.name].type
      if ((data.name as string).indexOf("__SET_EMPTY_VAR_") === 0) {
        const childType = getChildrenType(vType)
        switch (childType) {
          case Types.Int:
            return empty(Int)
          case Types.Bool:
            return empty(Bool)
          default:
            throw "idk not implemented"
        }
      }
      if (vType === Types.Int) {
        return Int.constant(data.name)
      } else if (vType === Types.Bool) {
        return Bool.constant(data.name)
      } else if (getParentType(vType) === Types.Set) {
        const childType = getChildrenType(vType)
        switch (childType) {
          case Types.Int:
            return Set(Int).constant(data.name)
          case Types.Bool:
            return Set(Bool).constant(data.name)
          default:
            throw "idk not implemented"
        }
      } else if (vType === Types.Unknown) {
        return Int.constant(data.name)
      }
    case "mathCompOp":
      const mcl: Ast = createAst(data.left)
      const mcr: Ast = createAst(data.right)
      switch (data.op) {
        case ">=":
          return ge(mcl, mcr)
        case "<=":
          return le(mcl, mcr)
        case ">":
          return gt(mcl, mcr)
        case "<":
          return lt(mcl, mcr)
        case "==":
          return eq(mcl, mcr)
        case "!=":
          return neq(mcl, mcr)
        default:
          throw "YIKES this shouldn't have happened " + data.type + " " + data.op
      }
    case "not":
      const val: Ast = createAst(data.value)
      return not(val)
    case "logicCompOp":
      const lcl: Ast = createAst(data.left)
      const lcr: Ast = createAst(data.right)
      switch (data.op) {
        case "==":
          return eq(lcl, lcr)
        case "!=":
          return neq(lcl, lcr)
        default:
          throw "YIKES this shouldn't have happened " + data.type + " " + data.op
      }
    case "set":
      const setVals: Ast[] = []
      for (const elem of data.data) {
        const elemAst = createAst(elem)
        setVals.push(elemAst)
      }
      return set(...setVals)
    case "setOp":
      const sl: Ast = createAst(data.left)
      const sr: Ast = createAst(data.right)
      switch (data.op) {
        case "|":
          return union(sl, sr)
        case "&":
          return intersect(sl, sr)
        case "\\":
          throw "not implemented"
        default:
          throw "YIKES this shouldn't have happened " + data.type + " " + data.op
      }
    case "setCompOp":
      const scl: Ast = createAst(data.left)
      const scr: Ast = createAst(data.right)
      switch (data.op) {
        case "==":
          return eq(scl, scr)
        case "!=":
          return neq(scl, scr)
        default:
          throw "YIKES this shouldn't have happened " + data.type + " " + data.op
      }
    case "setElemOp":
      const sel: Ast = createAst(data.left)
      const ser: Ast = createAst(data.right)
      return elemof(sel, ser)
    case "setEmpty":
      throw "shouldn't happen, all setEmpty should be gone"
    case "pred":
      return createAst(data.value)
    case "disjunct":
      const preds: Ast[] = []
      for (const elem of data.preds) {
        const pred: Ast = createAst(elem)
        preds.push(pred)
      }
      return or(...preds)
    case "conjunct":
      const preds2: Ast[] = []
      for (const elem of data.preds) {
        const pred2 = createAst(elem)
        preds2.push(pred2)
      }
      return and(...preds2)
    default:
      throw "YIKES this shouldn't have happened" + data
  }
}

function parseMain(input: string) {
  varMap = {}
  setEmptyVarsCt = 0
  parser.feed(input.split(" ").join("").trim())

  const res = parser.results[0]
  const t1 = flattenConjuntDisjunct(res)
  writeFileSync("output.json", JSON.stringify(flattenConjuntDisjunct(res), null, 2))

  const t2 = createSetEmptyVars(t1)
  // figure out the type/sorts of each var
  for (let i = 0; i < 3; i++) {
    typeinferVars(t2)
  }
  // if there are still unknowns, just assume every unknown variable is a bool
  for (let vname in varMap) {
    varMap[vname].type.replaceAll(Types.Unknown, Types.Bool)
  }
  console.log(varMap)

  const parseTree = remakeParseTree(t2)

  writeFileSync("output2.json", JSON.stringify(parseTree, null, 2))

  const ast = createAst(parseTree)
  console.log(ast.fmt())
  console.log(ast.typecheck())
  // console.log(JSON.stringify(flattenConjuntDisjunct(res), null, 2).replaceAll("\\\\", "\\"))
}

// const input = "(x1 + 2 * 3) * 3 != 2"
// const input = "(x > y) /\\ y == z"
// const input = "!x /\\ (x1 == 3 \\/ x1 > 3 \\/ (x1 + 2 * 3) * 3 != 2) /\\ x1 != y2"
// const input = "-3 + 2 > 1 /\\ 1 + 2 == 3"

// const input = "x != y /\\ (x == {1, 2, 3} | {4, 5, 5} \\/ 3 + 2 > 1)"
// const input = "x != y /\\ (x == {1, 2, 3} & {4, 5, 5} \\/ 3 + 2 > 1) /\\ a ∈ x /\\ x == ∅"
const input = "x != y /\\ (1 == 2 + -1 \\/ 3 + 2 > 1 \\/ a \\/ b) /\\ a ∈ x /\\ x == ∅"
// const input = "(1 == 2 + -1 \\/ 3 + 2 > 1 \\/ a \\/ b) /\\ a ∈ x /\\ x == ∅ /\\ b ∈ x"
// const input = "x == y /\\ x < 2"
// const input = "a == 1 /\\ a ∈ x /\\ x == ∅"
// const input = "x == {1, 2, 3} | {4, 5, 6}"
parseMain(input)
