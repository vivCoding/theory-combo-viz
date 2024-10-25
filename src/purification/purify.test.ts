import { add, Int, intval } from "../ast/theories/int";
import { eq, and, neq, Bool } from "../ast/theories/logic";
import { Set, set, single, elemof } from "../ast/theories/set";
import { baseTheory, intTheory, purification, setTheory } from "./theory";


test('basic', () => {
  const a = Int.constant("a");
  const b = Int.constant("b");
  const S = Set(Int).constant("S");
  const ast = and(
    eq(set(a,b,add(a, b)), S),
    neq(set(a, b), S),
    eq(b, intval(0)),
  );
  const p = purification([baseTheory, intTheory, setTheory], ast);
  expect(p[1].length).toEqual(2);
  expect(p[2][1]).toEqual(neq(set(a,b), S));
});