@{%
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
%}

@lexer lexer
main -> cnf {% id %}



mathexp -> sum {% id %}

sumOp -> "+" | "-"
sum ->
  sum sumOp product {% (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | product {% id %}

productOp -> "*" | "/" product ->
    product productOp mathval {% (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | mathval {% id %}

mathval -> literal {% id %} | "(" mathexp ")" {% (data) => data[1] %}

literal -> number {% id %} | variable {% id %}
number -> %number {% (data) => ({ type: "const", value: parseInt(data.join("")) }) %}
variable -> %word {% (data) => ({ type: "var", name: data.join("") }) %}

mathCompOp -> ">=" | "<=" | ">" | "<" | "==" | "!="
mathPred -> mathexp mathCompOp mathexp {% (data) => ({ type: "mathCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}

logicval -> [!]:? variable {% (data) => {return data[0] !== null ? { type: "not", value: data[1] } : data[1] } %}
logicCompOp -> "==" | "!="
logicPred ->
  logicval logicCompOp logicval {% (data) => ({ type: "logicCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | logicval {% id %}


# TODO add other stuff


setElem -> number {% id %} | variable {% id %}
setElems ->
  setElem "," setElems {% (data) => [data[0]].flat().concat(data[2]) %}
  | setElem {% id %}
set ->
  variable {% id %}
  | %setEmpty {% (data) => ({ type: "setEmpty", value: data[0].value }) %}
  | "{" setElems "}" {% (data) => ({ type: "set", data: data[1] }) %}

setExp ->
  setExp %setUnion setIntersect {% (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })  %}
  | setExp %setDifference setIntersect {% (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })  %}
  | setIntersect {% id %}

setIntersect ->
  setIntersect %setIntersect setVal {% (data) => ({ type: "setOp", left: data[0], op: data[1].value, right: data[2] })  %}
  | setVal {% id %}

setVal ->
  set {% id %}
  | "(" setExp ")" {% (data) => data[1] %}

setElemOp -> %setIn | %setNotIn
setElemPred -> variable setElemOp setExp {% (data) => ({ type: "setElemOp", left: data[0], op: data[1][0].value, right: data[2] })  %}
setCompOp -> "==" | "!="
setPred ->
  setElemPred {% id %}
  | setExp setCompOp setExp {% (data) => ({ type: "setCompOp", left: data[0], op: data[1][0].value, right: data[2] })  %}


pred ->
  logicPred {% (data) => ({ type: "pred", value: data[0] }) %}
  | mathPred {% (data) => ({ type: "pred", value: data[0] }) %}
  | setPred {% (data) => ({ type: "pred", value: data[0] }) %}

disjunct ->
  pred {% id %}
  | pred "\\/" disjunct {% (data) => ({ type: "disjunct", preds: [data[0]].concat(data[2]) }) %}

conjunct ->
  pred {% id %}
  | "(" disjunct ")" {% (data) => data[1] %}
  | conjunct "/\\" conjunct {% (data) => ({ type: "conjunct", preds: [data[0]].flat().concat(data[2]) }) %}

cnf ->
  disjunct {% id %}
  | conjunct {% id %}