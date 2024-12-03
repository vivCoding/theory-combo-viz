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
  sum sumOp product {% (data) => {return `(${data[0]} ${data[1]} ${data[2]})`} %}
  | product {% id %}

productOp -> "*" | "/" product ->
    product productOp mathval  {% (data) => {return `(${data[0]} ${data[1]} ${data[2]})`} %}
  | mathval {% id %}

mathval -> literal {% id %} | "(" mathexp ")" {% (data) => {return `${data[1]}`} %}

literal -> number {% id %} | variable {% id %}
number -> %number {% (data) => {return parseInt(data.join(""))} %}
variable -> %word {% (data) => {return data.join("")} %}

mathCompOp -> ">=" | "<=" | ">" | "<" | "==" | "!="
mathPred -> mathexp mathCompOp mathexp {% (data) => {
  console.log("mathPred", `${data[0]} ${data[1]} ${data[2]}`); return `${data[0]} ${data[1]} ${data[2]}`} %}

logicval -> [!]:? variable {% (data) => {return data[0] !== null ? `!${data[1]}` : data[1] } %}
logicCompOp -> "==" | "!="
logicPred ->
  logicval logicCompOp logicval {% (data) => {console.log("logicPred", `${data[0]} ${data[1]} ${data[2]}`); return `${data[0]} ${data[1]} ${data[2]}`} %}
  | logicval {% id %}




setElem -> number {% id %} | variable {% id %}
setElems -> setElem "," setElems {% (data) => {return `${data[0]}, ${data[2]}`} %} | setElem {% id %}
set -> variable {% id %} | %setEmpty {% id %} | "{" setElems "}" {% (data) => {return `{${data[1]}}`} %}

setExp ->
  setExp %setUnion setIntersect {% (data) => {return `(${data[0]} | ${data[2]})`} %}
  | setExp %setDifference setIntersect {% (data) => {return `(${data[0]} \\ ${data[2]})`} %}
  | setIntersect {% id %}

setIntersect ->
  setIntersect %setIntersect setVal {% (data) => `(${data[0]} & ${data[2]})`  %}
  | setVal {% id %}

setVal -> set {% id %} | "(" setExp ")" {% (data) => `${data[1]}` %}

setElemOp -> %setIn | %setNotIn
setElemPred -> variable setElemOp (setExp | variable) {% (data) => `${data[0]} ${data[1]} ${data[2]}` %}
setCompOp -> "==" | "!="
setPred ->
  setElemPred {% id %}
  | setExp setCompOp setExp {% (data) => {console.log("setPred", `${data[0]} ${data[1]} ${data[2]}`); return `${data[0]} ${data[1]} ${data[2]}`} %}


pred -> logicPred {% id %} | mathPred {% id %} | setPred {% id %}

disjunct -> pred {% id %} | pred "\\/" disjunct {% (data) => {return `${data[0]} \\/ ${data[2]}`} %}
conjunct ->
  pred {% id %}
  | "(" disjunct ")" {% (data) => {return `(${data[1]})`} %}
  | conjunct "/\\" conjunct {% (data) => {return `${data[0]} /\\ ${data[2]}`} %}

cnf ->
  disjunct {% (data) => {console.log("dj", data); return data[0] } %}
  | conjunct {% (data) => {console.log("cj", data); return data[0] } %}