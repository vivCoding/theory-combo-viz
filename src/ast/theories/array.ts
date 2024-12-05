import { Ast, operator, opfunc, SORT, SortAst, sortfunc } from "../ast"
import { basicOp, varargOp } from "../typecheck"

export const Arr = sortfunc("Arr", [SORT])
const _a = SORT.constant("_a")

// export const read =
