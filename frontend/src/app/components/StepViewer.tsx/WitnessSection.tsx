import { randomString } from "@/utils/misc"

import type { SolverStep, VarMapType } from "@/app/page"

interface WitnessSectionProps {
  witnessStep: SolverStep
  varMap: VarMapType
}

export const WitnessSection = ({ witnessStep, varMap }: WitnessSectionProps) => {
  if (witnessStep.type !== "witness") return

  return (
    <div id="witnessResults" className="border-slate-2 rounded-lg border p-6 shadow-lg">
      <h3 className="text-2xl font-bold">Witness Results</h3>
      <p className="text-sm italic text-gray-400">Introduce witness variables</p>

      <div className="my-5">
        <div className="flex flex-row items-baseline">
          <h3 className="mr-2 text-lg font-bold">
            <span className="inline-block w-8">
              T<sub>set</sub>
            </span>{" "}
            :{" "}
          </h3>
          {witnessStep.f1.split(/(\s+|\b)/).map((word, index) => {
            if (word.startsWith("__p")) {
              return (
                <span key={word + index} className="mx-1 font-bold text-blue-500">
                  {word}
                </span>
              )
            }
            if (word.startsWith("__e")) {
              return (
                <span key={word + index} className="mx-1 font-bold text-green-500">
                  {word}
                </span>
              )
            }

            if (word in varMap) {
              return (
                <span key={word + index} className="mx-1 text-lg font-bold text-orange-500">
                  {word}
                </span>
              )
            }
            // Otherwise, return the word as is
            return <span key={word + index}>{word}</span>
          })}
        </div>
      </div>
      {witnessStep.newVars.length === 0 ? (
        <h3 className="font-thin italic text-slate-400">Nothing to witness</h3>
      ) : (
        <div className="flex flex-row items-baseline">
          <h3 className="mr-2 text-lg font-bold">New Vars: </h3>
          {witnessStep.newVars.map((newVar, idx) => (
            <>
              <p key={randomString()} className="mx-1 font-bold text-green-600">
                {newVar}
              </p>
              {idx === witnessStep.newVars.length - 1 ? "" : ", "}
            </>
          ))}
        </div>
      )}
    </div>
  )
}
