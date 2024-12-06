@{%
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
%}

@lexer lexer
main -> cnf {% id %}



mathExp -> sum {% id %}

sumOp -> "+" | "-"
sum ->
  sum sumOp product {% (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | product {% id %}

productOp -> "*" | "/" product ->
    product productOp mathval {% (data) => ({ type: "arithOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | mathval {% id %}

mathval -> literal {% id %} | "(" mathExp ")" {% (data) => data[1] %}

literal -> number {% id %} | variable {% id %}
number -> %number {% (data) => ({ type: "const", value: parseInt(data.join("")) }) %}
variable -> %word {% (data) => ({ type: "var", name: data.join("") }) %}

mathCompOp -> ">=" | "<=" | ">" | "<"
mathPred -> mathExp mathCompOp mathExp {% (data) => ({ type: "mathCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}

# unused
# logicval -> [!]:? variable {% (data) => {return data[0] !== null ? { type: "not", value: data[1] } : data[1] } %}



setElem -> number {% id %} | variable {% id %} | mathExp {% id %}
setElems ->
  setElem "," setElems {% (data) => [data[0]].flat().concat(data[2]) %}
  | setElem {% (data) => [data[0]] %}
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
setElemValue -> variable {% id %} | number {% id %} | mathExp {% id %}
setElemPred -> setElemValue setElemOp setExp {% (data) => ({ type: "setElemOp", left: data[0], op: data[1][0].value, right: data[2] })  %}


arrayValue -> number {% id %} | variable {% id %} | mathExp {% id %}
arrayIndexValue -> number {% id %} | variable {% id %} | mathExp {% id %}
arrayRead -> variable "[" arrayIndexValue "]" {% (data) => ({ type: "arrayRead", arr: data[0], idx: data[2] })  %}
arrayWrite -> variable "[" arrayIndexValue "->" arrayValue "]" {% (data) => ({ type: "arrayWrite", arr: data[0], idx: data[2], value: data[4] })  %}
array -> arrayWrite {% id %} | variable {% id %}

  

eqCompOp -> "==" | "!="
eqPred ->
  mathExp eqCompOp mathExp {% (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | setExp eqCompOp setExp {% (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | arrayRead eqCompOp arrayValue {% (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}
  | array eqCompOp array {% (data) => ({ type: "eqCompOp", left: data[0], op: data[1][0].value, right: data[2] }) %}



pred ->
  eqPred {% (data) => ({ type: "pred", value: data[0] }) %}
  | mathPred {% (data) => ({ type: "pred", value: data[0] }) %}
  | setElemPred {% (data) => ({ type: "pred", value: data[0] }) %}

disjunct ->
  pred {% id %}
  | pred %or disjunct {% (data) => ({ type: "disjunct", preds: [data[0]].concat(data[2]) }) %}

conjunct ->
  pred {% id %}
  | "(" disjunct ")" {% (data) => data[1] %}
  | conjunct %and conjunct {% (data) => ({ type: "conjunct", preds: [data[0]].flat().concat(data[2]) }) %}

cnf ->
  disjunct {% id %}
  | conjunct {% id %}