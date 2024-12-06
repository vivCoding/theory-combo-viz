import express, { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { getVarsAndInferredTypes, parseToAst } from "./parsing"
import { combine } from "./combination/combine"
import { intTheory, setTheory } from "./theory/theory"

const app = express()

app.use(express.json())

app.post("/api/vars", async (req: Request, res: Response) => {
  console.log("got /api/vars")
  try {
    const { payload } = req.body
    const { formula, varMap } = payload

    try {
      const data = getVarsAndInferredTypes(formula, varMap)
      res.status(StatusCodes.OK).json({
        message: "ok",
        data: data,
      })
    } catch (e) {
      res.status(StatusCodes.OK).json({
        message: "bad",
        data: e,
      })
    }
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).send()
  }
})

app.post("/api/combine", async (req: Request, res: Response) => {
  console.log("got /api/combine")
  try {
    const { payload } = req.body
    const { formula, varMap } = payload
    try {
      const ast = parseToAst(formula, varMap)
      const solver = combine(setTheory, intTheory)
      const result = await solver(ast)
      console.log(result.status)

      res.status(StatusCodes.OK).json({
        message: "ok",
        data: {
          status: result.status,
          steps: result.steps ?? [],
        },
      })
    } catch (e) {
      res.status(StatusCodes.OK).json({
        message: "bad",
        data: e,
      })
    }
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).send()
  }
})

// Start the server
const port = 5000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
