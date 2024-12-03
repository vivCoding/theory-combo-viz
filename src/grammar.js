// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  ws: /[ \t]+/,
  word: /[0-9]*[a-zA-Z]+[0-9]*/,
  number: /\-?[0-9]+/,
  comparator:  />=|<=|>|<|==|!=/,
  and: /\\\//,
  or: /\/\\/,
  notOp:  /!/,
  arithOp:  /\+|\-|\*|\//,
  paren: /\(|\)/,
  setUnion: /\|/,
  setIntersect: /\&/,
  setDifference: /\\/,
  setIn: /∈/,
  setNotIn: /∉/,
  setEmpty: /∅/,
  setBrackets: /\{|\}/,
  comma: ",",
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["cnf"], "postprocess": id},
    {"name": "mathexp", "symbols": ["sum"], "postprocess": id},
    {"name": "sumOp", "symbols": [{"literal":"+"}]},
    {"name": "sumOp", "symbols": [{"literal":"-"}]},
    {"name": "sum", "symbols": ["sum", "sumOp", "product"], "postprocess": (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "sum", "symbols": ["product"], "postprocess": id},
    {"name": "productOp", "symbols": [{"literal":"*"}]},
    {"name": "productOp", "symbols": [{"literal":"/"}]},
    {"name": "product", "symbols": ["product", "productOp", "mathval"], "postprocess": (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "product", "symbols": ["mathval"], "postprocess": id},
    {"name": "mathval", "symbols": ["literal"], "postprocess": id},
    {"name": "mathval", "symbols": [{"literal":"("}, "mathexp", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "literal", "symbols": ["number"], "postprocess": id},
    {"name": "literal", "symbols": ["variable"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => ({ type: "const", value: parseInt(data.join("")) })},
    {"name": "variable", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ({ type: "var", name: data.join("") })},
    {"name": "mathCompOp", "symbols": [{"literal":">="}]},
    {"name": "mathCompOp", "symbols": [{"literal":"<="}]},
    {"name": "mathCompOp", "symbols": [{"literal":">"}]},
    {"name": "mathCompOp", "symbols": [{"literal":"<"}]},
    {"name": "mathCompOp", "symbols": [{"literal":"=="}]},
    {"name": "mathCompOp", "symbols": [{"literal":"!="}]},
    {"name": "mathPred", "symbols": ["mathexp", "mathCompOp", "mathexp"], "postprocess": (data) => ({ type: "mathCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "logicval$ebnf$1", "symbols": [/[!]/], "postprocess": id},
    {"name": "logicval$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "logicval", "symbols": ["logicval$ebnf$1", "variable"], "postprocess": (data) => {return data[0] !== null ? { type: "not", value: data[1] } : data[1] }},
    {"name": "logicCompOp", "symbols": [{"literal":"=="}]},
    {"name": "logicCompOp", "symbols": [{"literal":"!="}]},
    {"name": "logicPred", "symbols": ["logicval", "logicCompOp", "logicval"], "postprocess": (data) => ({ type: "logicCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "logicPred", "symbols": ["logicval"], "postprocess": id},
    {"name": "setElem", "symbols": ["number"], "postprocess": id},
    {"name": "setElem", "symbols": ["variable"], "postprocess": id},
    {"name": "setElems", "symbols": ["setElem", {"literal":","}, "setElems"], "postprocess": (data) => [data[0]].flat().concat(data[2])},
    {"name": "setElems", "symbols": ["setElem"], "postprocess": id},
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
    {"name": "setElemPred", "symbols": ["variable", "setElemOp", "setExp"], "postprocess": (data) => ({ type: "setElemOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "setCompOp", "symbols": [{"literal":"=="}]},
    {"name": "setCompOp", "symbols": [{"literal":"!="}]},
    {"name": "setPred", "symbols": ["setElemPred"], "postprocess": id},
    {"name": "setPred", "symbols": ["setExp", "setCompOp", "setExp"], "postprocess": (data) => ({ type: "setCompOp", left: data[0], op: data[1][0].value, right: data[2] })},
    {"name": "pred", "symbols": ["logicPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "pred", "symbols": ["mathPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "pred", "symbols": ["setPred"], "postprocess": (data) => ({ type: "pred", value: data[0] })},
    {"name": "disjunct", "symbols": ["pred"], "postprocess": id},
    {"name": "disjunct", "symbols": ["pred", {"literal":"\\/"}, "disjunct"], "postprocess": (data) => ({ type: "disjunct", preds: [data[0]].concat(data[2]) })},
    {"name": "conjunct", "symbols": ["pred"], "postprocess": id},
    {"name": "conjunct", "symbols": [{"literal":"("}, "disjunct", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "conjunct", "symbols": ["conjunct", {"literal":"/\\"}, "conjunct"], "postprocess": (data) => ({ type: "conjunct", preds: [data[0]].flat().concat(data[2]) })},
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
