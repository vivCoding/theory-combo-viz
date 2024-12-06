// just make the entire frontend work on client side
"use client"
import axios from "axios"
import { useEffect, useState } from "react"

import { InputSection } from "./components/InputSection"
import { StepViewer } from "./components/StepViewer.tsx"

export type SolverStep =
  | { type: "purification"; f1: string; f2: string; oldVars: string[]; newVars: string[] }
  | { type: "witness"; f1: string; newVars: string[]; changed: boolean }
  | { type: "arrangement"; arrangement: { var1: string; op: string; var2: string }[]; f1: string; f2: string; result1: string; result2: string }

export type VarMapType = Record<string, { type: string }>

const EXAMPLES = [
  "a == 2 + 3 ∧ b == 5 * x ∧ x == 1 ∧ (a ∉ S ∨ b ∈ S)",
  "S == {2 + 3} ∧ T == {1 + 4} ∧ S \\ T == ∅",
  "S == {2 + 3} ∧ T == {1 + 4} ∧ S != T",
  "x == (5 * 4 / 10) + 1 ∧ s == ({1 + 2} ∪ {x}) \\ {3} ∧ s != ∅",
  "x != y ∧ x ∩ y == ∅ ∧ 1 ∈ x",
  "x != ∅ ∧ y != ∅ ∧ x ∪ y == ∅ ∧ 1 ∉ x",
  "x == {3 + 5, 1} ∧ 8 ∈ x ∧ 2 - 1 ∉ x"
]

export default function Home() {
  const [steps, setSteps] = useState([] as SolverStep[])
  const [status, setStatus] = useState("")
  const [formula, setFormula] = useState("")
  const [varMap, setVarMap] = useState<VarMapType>({})
  const [example, setExample] = useState("")

  const onStepsChange = (formula: string, steps: SolverStep[], status: string, varMap: VarMapType) => {
    setFormula(formula)
    setSteps(steps)
    setStatus(status)
    setVarMap(varMap)
  }

  const resetStuff = () => {
    setFormula("")
    setSteps([])
    setStatus("")
  }

  return (
    <div className="mb-10 flex w-full flex-col items-center p-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold">Theory Combo Viz</h1>
        <p className="mt-3 text-lg italic text-gray-600">Welcome to the theory combination visualizer!</p>
        <p className="text-sm text-gray-600">
          <a href="https://link.springer.com/chapter/10.1007/11559306_3" className="text-blue-400 underline transition hover:text-blue-600">
            Reference paper
          </a>
        </p>
      </div>
      <div className="mt-6 flex w-full flex-row items-start gap-x-6">
        <div id="helpSection" className="border-slate-2 flex-1 rounded-lg border p-6 shadow-lg">
          <h3 className="mb-4 text-3xl font-bold">Usage</h3>
          <p>Write your formula in the theory of ints and sets, and then you can check the steps done to verify satisfiability!</p>
          <div className="my-4">
            <h6 className="mb-2 text-xl font-bold">Syntax</h6>
            <ul>
              <li>
                <span className="font-bold">Equality:</span> ==, !=
              </li>
              <li>
                <span className="font-bold">Sets:</span> You can use brackets like so - {"{1, 2, ...}"},
              </li>
              <li>
                <span className="font-bold">Variables:</span> Alphanumeric word
              </li>
              <li>
                <span className="font-bold">Constants:</span> integers
              </li>
              <li>
                <span className="font-bold">Arithmetic:</span> +, -, * /
              </li>
              <li>
                <span className="font-bold">Int comparison:</span> {">, <, >=, <="}
              </li>
            </ul>
          </div>
          <p>When writing variables, it is good practice to explicitly define its type. However, variables types can still be inferred for convenience.</p>

          <div className="my-4">
            <h6 className="mb-2 text-xl font-bold">Limitations</h6>
            <ul className="list-disc pl-5">
              <li>Limited theories</li>
              <li>No nested data structures</li>
              <li>Very little fancy animations 😢</li>
            </ul>
          </div>
        </div>
        <div className="flex w-[45vw] flex-col items-stretch space-y-6">
          <InputSection onStepsChange={onStepsChange} resetStuff={resetStuff} />
          {status !== "" && <StepViewer formula={formula} steps={steps} status={status} varMap={varMap} />}
        </div>
        <div id="exampleSection" className="border-slate-2 flex-1 rounded-lg border p-6 shadow-lg">
          <h3 className="mb-4 text-3xl font-bold">Examples</h3>
          <ul className="list-disc pl-4">
            {EXAMPLES.map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
