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
  "x == {3 + 5, 1} ∧ 8 ∈ x ∧ 2 - 1 ∉ x",
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
              <li>Not mobile responsive (due to laziness)</li>
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

      <div className="fixed right-0 top-0 z-[99] p-6">
        <a
          className="group relative inline-block text-4xl hover:cursor-pointer"
          href="https://github.com/vivCoding/theory-combo-viz"
          title="View GitHub"
          target="_blank"
          rel="noreferrer noopener"
        >
          <svg
            className="transition group-hover:scale-110 group-hover:opacity-70"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 496 512"
          >
            {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
