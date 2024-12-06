import { ComboSection } from "./ComboSection"
import { PurificationSection } from "./PurificationSection"
import { WitnessSection } from "./WitnessSection"

import type { SolverStep, VarMapType } from "@/app/page"

interface StepViewerProps {
  formula: string
  steps: SolverStep[]
  status: string
  varMap: VarMapType
}

export const StepViewer = ({ formula, steps, status, varMap }: StepViewerProps) => {
  const purificationStep = steps.length > 0 && steps[0].type === "purification" ? steps[0] : undefined
  const witnessStep = steps.length > 1 && steps[1].type === "witness" ? steps[1] : undefined

  return (
    <div className="flex w-full flex-col items-stretch space-y-6">
      {steps.length === 0 && (
        <div className="border-slate-2 rounded-lg border px-6 py-4 text-center shadow-lg">
          <p className="italic text-gray-400">No combination needed</p>
          <p className="-mt-2 italic text-gray-400">(Only one theory used)</p>
        </div>
      )}

      {purificationStep && <PurificationSection purificationStep={purificationStep} varMap={JSON.parse(JSON.stringify(varMap))} />}
      {witnessStep && <WitnessSection witnessStep={witnessStep} varMap={JSON.parse(JSON.stringify(varMap))} />}
      {steps.length > 0 && <ComboSection steps={steps} varMap={JSON.parse(JSON.stringify(varMap))} />}
      <div id="resultsSection" className="border-slate-2 rounded-lg border p-6 shadow-lg">
        <h3 className="text-2xl font-bold">
          <span>Result:</span>{" "}
          {status === "sat" ? (
            <span className="text-green-700">{status}</span>
          ) : status === "unsat" ? (
            <span className="text-red-500">{status}</span>
          ) : (
            <span className="">{status}</span>
          )}
        </h3>
      </div>
    </div>
  )
}
