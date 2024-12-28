"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const parsing_1 = require("./parsing");
const combine_1 = require("./combination/combine");
const theory_1 = require("./theory/theory");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", async (req, res) => {
    console.log("got /");
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "ok",
        data: "hello world!"
    });
});
app.post("/api/hello", async (req, res) => {
    console.log("got /api/hello");
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "ok",
        data: "hello world api!"
    });
});
app.post("/api/vars", async (req, res) => {
    console.log("got /api/vars");
    try {
        const { payload } = req.body;
        const { formula, varMap } = payload;
        try {
            const data = (0, parsing_1.getVarsAndInferredTypes)(formula, varMap);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "ok",
                data: data,
            });
        }
        catch (e) {
            console.log("yikes", e);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "bad",
                data: e,
            });
        }
    }
    catch (e) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send();
    }
});
app.post("/api/combine", async (req, res) => {
    console.log("got /api/combine");
    const timeout = setTimeout(() => {
        res.status(http_status_codes_1.StatusCodes.GATEWAY_TIMEOUT).send();
    }, 20000);
    try {
        const { payload } = req.body;
        const { formula, varMap } = payload;
        try {
            const ast = (0, parsing_1.parseToAst)(formula, varMap);
            const solver = (0, combine_1.combine)(theory_1.setTheory, theory_1.intTheory);
            const result = await solver(ast);
            console.log(result.status);
            res.on("finish", () => clearTimeout(timeout));
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "ok",
                data: {
                    status: result.status,
                    steps: result.steps ?? [],
                },
            });
        }
        catch (e) {
            res.on("finish", () => clearTimeout(timeout));
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "bad",
                data: e,
            });
        }
    }
    catch (e) {
        res.on("finish", () => clearTimeout(timeout));
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send();
    }
});
// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
