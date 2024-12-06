import { Ast, SORT, SortAst, operator, opfunc, sortfunc } from "../ast"
import { basicOp, varargOp } from "../typecheck"

export const Arr = sortfunc("Arr", [SORT])
const _a = SORT.constant("_a")

// export const read =
