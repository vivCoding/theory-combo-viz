import { randomString } from "@/utils/misc"

import type { SolverStep, VarMapType } from "@/app/page"

interface PurifcationSectionProps {
  purificationStep: SolverStep
  varMap: VarMapType
}

export const PurificationSection = ({ purificationStep, varMap }: PurifcationSectionProps) => {
  if (purificationStep.type !== "purification") return

  return (
    <div id="purificationResults" className="border-slate-2 rounded-lg border p-6 shadow-lg">
      <h3 className="text-2xl font-bold">Purification Results</h3>
      <p className="text-sm italic text-gray-400">Split formula into appropriate theories</p>

      <div className="my-5">
        <div className="flex flex-row items-baseline">
          <h3 className="mr-2 text-lg font-bold">
            <span className="inline-block w-8">
              T<sub>set</sub>
            </span>{" "}
            :{" "}
          </h3>
          {purificationStep.f1.split(/(\s+|\b)/).map((word, index) => {
            // Check if the word starts with __p and apply blue color
            if (word.startsWith("__p")) {
              return (
                <span key={word + index} className="mx-1 font-bold text-blue-600">
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
        <div className="flex flex-row items-baseline">
          <h3 className="mr-2 text-lg font-bold">
            <span className="inline-block w-8">
              T<sub>Z</sub>
            </span>{" "}
            :{"  "}
          </h3>
          {purificationStep.f2.split(/(\s+|\b)/).map((word, index) => {
            // Check if the word starts with __p and apply blue color
            if (word.startsWith("__p")) {
              return (
                <span key={word + index} className="mx-1 font-bold text-blue-600">
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

      {purificationStep.newVars.length === 0 ? (
        <h3 className="font-thin italic text-slate-400">No new vars introduced</h3>
      ) : (
        <div className="flex flex-row items-baseline">
          <h3 className="mr-2 text-lg font-bold">New Vars: </h3>
          {purificationStep.newVars.map((newVar, idx) => (
            <>
              <p key={randomString()} className="mx-1 font-bold text-blue-600">
                {newVar}
              </p>
              {idx === purificationStep.newVars.length - 1 ? "" : ", "}
            </>
          ))}
        </div>
      )}
    </div>
  )
}
