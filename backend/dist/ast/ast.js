"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstId = exports.SORT = exports.SortId = void 0;
exports.operator = operator;
exports.opfunc = opfunc;
exports.sort = sort;
exports.sortfunc = sortfunc;
exports.constant = constant;
const typecheck_1 = require("./typecheck");
// This is the function to create an `Op`
function operator(name, value, tychk, formatting = { type: "function" }) {
    return {
        name,
        value,
        fmt: function (prec) {
            const args = this.args || [];
            prec = prec || 0;
            let result = "";
            switch (formatting.type) {
                case "prefix":
                    result = name + args.map((a) => a.fmt(formatting.prec || prec)).join(" ");
                    break;
                case "infix":
                    result = args.map((a) => a.fmt(formatting.prec || prec)).join(" " + name + " ");
                    break;
                case "suffix":
                    result = args.map((a) => a.fmt(formatting.prec || prec)).join(" ") + name;
                    break;
                case "function":
                    result = name + (args.length > 0 ? "(" + args.map((a) => a.fmt(0)).join(", ") + ")" : "");
                    break;
                case "bracket":
                    result = name.split("$")[0] + args.map((a) => a.fmt(0)).join(", ") + name.split("$")[1];
                    break;
            }
            if (formatting.prec && prec > formatting.prec) {
                return "(" + result + ")";
            }
            return result;
        },
        typecheck: function () {
            return tychk(name, this.args || []);
        },
        equals: function (that) {
            if (!("name" in that)) {
                return false;
            }
            if (this.name != that.name) {
                return false;
            }
            if (this.value && that.value && !(0, typecheck_1.EQ)(this.value, that.value)) {
                return false;
            }
            const thisargs = this.args || [];
            const thatargs = that.args || [];
            return thisargs.length == thatargs.length && thisargs.every((a, i) => a.equals(thatargs[i]));
        },
    };
}
// This will create an `Op` and then return a function to create an Ast
function opfunc(name, value, tychk, formatting = { type: "function" }) {
    const op = operator(name, value, tychk, formatting);
    return (...args) => {
        return { ...op, args };
    };
}
// Use class as identififer. `==` will compare the reference.
class SortId {
    name;
    constructor(name) {
        this.name = name;
    }
}
exports.SortId = SortId;
// Create a sort
function sort(name) {
    const op = operator(name, new SortId(name), (0, typecheck_1.basicOp)([], exports.SORT));
    return {
        ...op,
        constant: function (name) {
            return constant(this, name);
        },
    };
}
// Sort for all sorts
exports.SORT = {
    ...operator("SORT", new SortId("SORT"), (0, typecheck_1.basicOp)([], null)),
    constant: function (name) {
        return constant(this, name);
    },
};
// Create a sort that can create new sorts.
function sortfunc(name, args = []) {
    const op = operator(name, new SortId(name), (0, typecheck_1.basicOp)(args, exports.SORT));
    const sort = {
        ...op,
        constant: function (name) {
            return constant(this, name);
        },
    };
    return (...args) => {
        return { ...sort, args };
    };
}
// Use class as identififer. `==` will compare the reference.
class ConstId {
    name;
    sort;
    constructor(name, sort) {
        this.name = name;
        this.sort = sort;
    }
    equals(that) {
        if (this.name == that.name && !this.sort.equals(that.sort)) {
            throw new Error(`ConstId ${this.name} has different sorts`);
        }
        return this.name == that.name;
    }
    as_ast() {
        return operator(this.name, this, (0, typecheck_1.basicOp)([], this.sort), { type: "function" });
    }
}
exports.ConstId = ConstId;
// Create a constant (actually a variable in `def-var`, but everybody is calling this 'constant')
const counter = new Map();
function constant(sort, name) {
    if (name.includes("$")) {
        const id = counter.get(name) || 0;
        counter.set(name, id + 1);
        name = name.replace("$", toSubscript(id));
    }
    return new ConstId(name, sort).as_ast();
}
function toSubscript(num) {
    // const subscriptNumbers = "₀₁₂₃₄₅₆₇₈₉";
    const subscriptNumbers = "0123456789";
    return num.toString().split('').map(digit => subscriptNumbers[parseInt(digit)]).join('');
}
