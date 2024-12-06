import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import { useEffect, useRef, useState } from "react"

import type { SolverStep, VarMapType } from "../page"

interface InputSectionProps {
  onStepsChange: (formula: string, steps: SolverStep[], status: string, varMap: VarMapType) => void
  resetStuff: () => void
}

export const InputSection = ({ onStepsChange, resetStuff }: InputSectionProps) => {
  const [inputFormula, setInputFormula] = useState("")
  const inputElem = useRef<HTMLInputElement>(null)
  const [vars, setVars] = useState([] as { name: string; type: string }[])
  const [error, setError] = useState("")
  const [showUsage, setShowUsage] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [loading, setLoading] = useState(false)

  const addSymbolToInput = (sym: string) => {
    if (inputElem.current === null) return
    inputElem.current.focus()
    const cursorPosition = inputElem.current.selectionStart
    if (!cursorPosition) return
    const newValue = inputFormula.slice(0, cursorPosition) + sym + inputFormula.slice(cursorPosition)
    setInputFormula(newValue)
    setTimeout(() => {
      if (inputElem.current === null) return
      inputElem.current.selectionStart = inputElem.current.selectionEnd = cursorPosition + 1
    }, 0)
  }

  const doSolver = async (formula: string, varMap: VarMapType) => {
    setLoading(true)
    try {
      const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVER + "/api/combine", {
        payload: {
          formula,
          varMap,
        },
      })
      if (res.status === 200) {
        const { message, data } = res.data
        if (message === "ok") {
          const { status, steps } = data
          // TODO
          onStepsChange(formula, steps, status, JSON.parse(JSON.stringify(varMap)))
        } else {
          setError("Error in solving " + data)
        }
      } else {
        setError("Something went wrong in the server")
      }
    } catch (e) {
      setError("Something went wrong " + e)
    }
    setLoading(false)
  }

  const submitInput = async () => {
    setError("")
    resetStuff()
    setLoading(true)
    try {
      const varMap = vars.reduce((acc: VarMapType, { name, type }) => {
        acc[name] = { type }
        return acc
      }, {})
      const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVER + "/api/vars", {
        payload: {
          formula: inputFormula,
          varMap,
        },
      })
      if (res.status === 200) {
        const { message, data } = res.data
        if (message === "ok") {
          const good = true
          const varsTemp = []
          for (const vname in data) {
            varsTemp.push({
              name: vname,
              type: data[vname].type,
            })
            if (data[vname].type.indexOf("Unknown") !== -1) {
              setError("Some variables with unknown types")
            }
          }
          setVars(varsTemp)
          const newVarMap = varsTemp.reduce((acc: VarMapType, { name, type }) => {
            acc[name] = { type }
            return acc
          }, {})
          if (good) {
            await doSolver(inputFormula, newVarMap)
          }
        } else {
          setError(data)
        }
      } else {
        setError("Something went wrong in the server")
      }
    } catch (e) {
      setError("Something went wrong " + e)
    }
    setLoading(false)
  }

  return (
    <div id="inputSection" className="border-slate-2 rounded-lg border p-6 shadow-lg">
      <div className="flex flex-row justify-center">
        <input
          id="formulaInput"
          ref={inputElem}
          type="text"
          placeholder="Enter your formula"
          size={50}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-lg transition placeholder:italic hover:bg-slate-100 focus:border-blue-500 focus:bg-slate-100 focus:outline-none"
          value={inputFormula}
          onChange={(e) => setInputFormula(e.target.value)}
        />
        <button
          className="ml-3 rounded-lg bg-blue-500 px-3 py-2 text-white transition enabled:hover:bg-blue-900 disabled:opacity-70"
          onClick={submitInput}
          disabled={loading}
        >
          {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <span>Go!</span>}
        </button>
      </div>
      <div className="mt-2 flex flex-row space-x-2">
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∈")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∈
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∉")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∉
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∅")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∅
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∪")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∪
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∩")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∩
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∧")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∧
        </button>
        <button
          className="rounded-lg border border-slate-300 bg-slate-200 px-2 py-1 transition enabled:hover:bg-slate-300 disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => addSymbolToInput("∨")}
          disabled={inputElem.current !== null && inputElem.current !== document.activeElement}
        >
          ∨
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold">Formula variables</h3>
        <p className="text-sm italic text-slate-400">Variables type can be inferred or explicit</p>
        <ul className="mb-4 mt-2">
          {vars.map(({ name: vname, type }, idx) => (
            <li key={vname + idx} className="">
              <button
                className="mr-4 text-red-500 transition hover:text-red-800"
                onClick={() => {
                  setVars(vars.filter((_, i) => i !== idx))
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <span className="font-bold">Name:</span>{" "}
              <input
                type="text"
                // placeholder="Enter variable name"
                size={3}
                className="rounded border border-slate-300 px-1 transition placeholder:italic hover:bg-slate-100 focus:border-blue-500 focus:bg-slate-100 focus:outline-none"
                value={vname}
                onChange={(e) => {
                  const newVars = [...vars]
                  newVars[idx] = { ...newVars[idx], name: e.target.value }
                  setVars(newVars)
                }}
              />
              <span className="ml-2 font-bold">Type:</span>{" "}
              <select
                id="dropdown"
                value={type}
                onChange={(e) => {
                  const newVars = [...vars]
                  newVars[idx] = { ...newVars[idx], type: e.target.value }
                  setVars(newVars)
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unknown" disabled>
                  Unknown
                </option>
                <option value="Int">Int</option>
                <option value="Set_Int">Set Int</option>
              </select>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-row space-x-2">
          {/* <button
            className="rounded bg-blue-500 px-2 py-1 text-white transition hover:bg-blue-900"
            onClick={() => {
              setVars([...vars, { name: "", type: "Int" }])
            }}
          >
            Infer Types
          </button> */}
          <button
            className="rounded bg-blue-500 px-2 py-1 text-white transition hover:bg-blue-900"
            onClick={() => {
              setVars([...vars, { name: "", type: "Int" }])
            }}
          >
            Add Typed Var
          </button>
          <button
            className="rounded bg-red-500 px-2 py-1 text-white transition hover:bg-red-800"
            onClick={() => {
              setVars([])
            }}
          >
            Delete All
          </button>
        </div>
      </div>
      {error !== "" && (
        <div className="mt-6 rounded border border-red-600 bg-red-200 px-4 py-2">
          <h3 className="text-red-800">
            <span className="font-bold">Error:</span> {error}
          </h3>
        </div>
      )}
    </div>
  )
}
