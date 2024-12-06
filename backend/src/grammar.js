// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  ws: /[ \t]+/,
  word: /[0-9]*[a-zA-Z]+[0-9]*/,
  comparator:  />=|<=|>|<|==|!=/,
  and: /\∧/,
  or: /\∨/,
  notOp:  /!/,
  arrayWrite: /\-\>/,
  arithOp:  /\+|\-|\*|\//,
  number: /\-?[0-9]+/,
  paren: /\(|\)/,
  setUnion: /\∪/,
  setIntersect: /\∩/,
  setDifference: /\\/,
  setIn: /∈/,
  setNotIn: /∉/,
  setEmpty: /∅/,
  setBrackets: /\{|\}/,
  arrayBrackets: /\[|\]/,
  comma: ",",
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["cnf"], "postprocess": id},
    {"name": "mathExp", "symbols": ["sum"], "postprocess": id},
    {"name": "sumOp", "symbols": [{"literal":"+"}]},
    {"name": "sumOp", "symbols": [{"literal":"-"}]},
    {"name": "sum", "symbols": ["sum", "sumOp", "product"], "postprocess": (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "sum", "symbols": ["product"], "postprocess": id},
    {"name": "productOp", "symbols": [{"literal":"*"}]},
    {"name": "productOp", "symbols": [{"literal":"/"}]},
    {"name": "product", "symbols": ["product", "productOp", "mathval"], "postprocess": (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "product", "symbols": ["mathval"], "postprocess": id},
    {"name": "mathval", "symbols": ["literal"], "postprocess": id},
    {"name": "mathval", "symbols": [{"literal":"("}, "mathExp", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "literal", "symbols": ["number"], "postprocess": id},
    {"name": "literal", "symbols": ["variable"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => ({ type: "const", value: parseInt(data.join("")) })},
    {"name": "variable", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ({ type: "var", name: data.join("") })},
    {"name": "mathCompOp", "symbols": [{"literal":">="}]},
    {"name": "mathCompOp", "symbols": [{"literal":"<="}]},
    {"name": "mathCompOp", "symbols": [{"literal":">"}]},
    {"name": "mathCompOp", "symbols": [{"literal":"<"}]},
    {"name": "mathPred", "symbols": ["mathExp", "mathCompOp", "mathExp"], "postprocess": (data) => ({ type: "mathCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "setElem", "symbols": ["number"], "postprocess": id},
    {"name": "setElem", "symbols": ["variable"], "postprocess": id},
    {"name": "setElem", "symbols": ["mathExp"], "postprocess": id},
    {"name": "setElems", "symbols": ["setElem", {"literal":","}, "setElems"], "postprocess": (data) => [data[0]].flat().concat(data[2])},
    {"name": "setElems", "symbols": ["setElem"], "postprocess": (data) => [data[0]]},
    {"name": "set", "symbols": ["variable"], "postprocess": id},
    {"name": "set", "symbols": [(lexer.has("setEmpty") ? {type: "setEmpty"} : setEmpty)], "postprocess": (data) => ({ type: "setEmpty", value: data[0].value })},
    {"name": "set", "symbols": [{"literal":"{"}, "setElems", {"literal":"}"}], "postprocess": (data) => ({ type: "set", data: data[1] })},
    {"name": "setExp", "symbols": ["setExp", (lexer.has("setUnion") ? {type: "setUnion"} : setUnion), "setIntersect"], "postprocess": (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })},
    {"name": "setExp", "symbols": ["setExp", (lexer.has("setDifference") ? {type: "setDifference"} : setDifference), "setIntersect"], "postprocess": (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })},
    {"name": "setExp", "symbols": ["setIntersect"], "postprocess": id},
    {"name": "setIntersect", "symbols": ["setIntersect", (lexer.has("setIntersect") ? {type: "setIntersect"} : setIntersect), "setVal"], "postprocess": (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })},
    {"name": "setIntersect", "symbols": ["setVal"], "postprocess": id},
    {"name": "setVal", "symbols": ["set"], "postprocess": id},
    {"name": "setVal", "symbols": [{"literal":"("}, "setExp", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "setElemOp", "symbols": [(lexer.has("setIn") ? {type: "setIn"} : setIn)]},
    {"name": "setElemOp", "symbols": [(lexer.has("setNotIn") ? {type: "setNotIn"} : setNotIn)]},
    {"name": "setElemValue", "symbols": ["variable"], "postprocess": id},
    {"name": "setElemValue", "symbols": ["number"], "postprocess": id},
    {"name": "setElemValue", "symbols": ["mathExp"], "postprocess": id},
    {"name": "setElemPred", "symbols": ["setElemValue", "setElemOp", "setExp"], "postprocess": (data) => ({ type: "setElemOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "arrayValue", "symbols": ["number"], "postprocess": id},
    {"name": "arrayValue", "symbols": ["variable"], "postprocess": id},
    {"name": "arrayValue", "symbols": ["mathExp"], "postprocess": id},
    {"name": "arrayIndexValue", "symbols": ["number"], "postprocess": id},
    {"name": "arrayIndexValue", "symbols": ["variable"], "postprocess": id},
    {"name": "arrayIndexValue", "symbols": ["mathExp"], "postprocess": id},
    {"name": "arrayRead", "symbols": ["variable", {"literal":"["}, "arrayIndexValue", {"literal":"]"}], "postprocess": (data) => ({ type: "arrayRead", arr: data[0], idx: data[2] })},
    {"name": "arrayWrite", "symbols": ["variable", {"literal":"["}, "arrayIndexValue", {"literal":"->"}, "arrayValue", {"literal":"]"}], "postprocess": (data) => ({ type: "arrayWrite", arr: data[0], idx: data[2], value: data[4] })},
    {"name": "array", "symbols": ["arrayWrite"], "postprocess": id},
    {"name": "array", "symbols": ["variable"], "postprocess": id},
    {"name": "eqCompOp", "symbols": [{"literal":"=="}]},
    {"name": "eqCompOp", "symbols": [{"literal":"!="}]},
    {"name": "eqPred", "symbols": ["mathExp", "eqCompOp", "mathExp"], "postprocess": (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "eqPred", "symbols": ["setExp", "eqCompOp", "setExp"], "postprocess": (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "eqPred", "symbols": ["arrayRead", "eqCompOp", "arrayValue"], "postprocess": (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "eqPred", "symbols": ["array", "eqCompOp", "array"], "postprocess": (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "pred", "symbols": ["eqPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "pred", "symbols": ["mathPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "pred", "symbols": ["setElemPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "disjunct", "symbols": ["pred"], "postprocess": id},
    {"name": "disjunct", "symbols": ["pred", (lexer.has("or") ? {type: "or"} : or), "disjunct"], "postprocess": (data) => ({ type: "disjunct", preds: [data[0]].concat(data[2]) })},
    {"name": "conjunct", "symbols": ["pred"], "postprocess": id},
    {"name": "conjunct", "symbols": [{"literal":"("}, "disjunct", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "conjunct", "symbols": ["conjunct", (lexer.has("and") ? {type: "and"} : and), "conjunct"], "postprocess": (data) => ({ type: "conjunct", preds: [data[0]].flat().concat(data[2]) })},
    {"name": "cnf", "symbols": ["disjunct"], "postprocess": id},
    {"name": "cnf", "symbols": ["conjunct"], "postprocess": id}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
