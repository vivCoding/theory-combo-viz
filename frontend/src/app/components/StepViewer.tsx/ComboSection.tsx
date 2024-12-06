import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"

import type { SolverStep, VarMapType } from "@/app/page"

interface CombinationStepProps {
  steps: SolverStep[]
  varMap: VarMapType
}

export const ComboSection = ({ steps, varMap }: CombinationStepProps) => {
  const comboSteps = steps.filter((step) => step.type === "arrangement")
  const [currIdx, setCurrIdx] = useState(0)

  const [currEqVars, setCurrEqVars] = useState([] as string[])
  const [currNeqqVars, setCurrNeqVars] = useState([] as string[])

  useEffect(() => {
    setCurrEqVars([
      ...new Set(
        comboSteps[currIdx].arrangement
          .filter(({ op }) => op == "=")
          .map(({ var1, var2 }) => [var1, var2])
          .flat()
      ),
    ])
    setCurrNeqVars([
      ...new Set(
        comboSteps[currIdx].arrangement
          .filter(({ op }) => op == "!=")
          .map(({ var1, var2 }) => [var1, var2])
          .flat()
      ),
    ])
  }, [currIdx])

  useEffect(() => {
    setCurrIdx(0)
  }, [steps])

  return (
    <div id="comboResults" className="border-slate-2 rounded-lg border p-6 shadow-lg">
      <h3 className="text-2xl font-bold">Guess and Check</h3>
      <p className="mb-4 text-sm italic text-gray-400">Enumerating through possible arrangements</p>

      {comboSteps.length === 0 ? (
        <h3 className="mt-6 font-thin italic text-slate-400">No additional steps made</h3>
      ) : (
        <>
          {comboSteps[currIdx].arrangement.length === 0 ? (
            <>
              <p className="italic text-gray-400">No arrangements needed</p>
              <p className="-mt-2 italic text-gray-400">(Only one variable)</p>
            </>
          ) : (
            <div className="my-6">
              <h3 className="mr-2 text-center font-bold">Arrangement: </h3>
              <table className="mx-auto w-[70%] border border-black">
                <thead>
                  <tr>
                    <th className="border border-black font-bold">==</th>
                    <th className="border border-black font-bold">!=</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="w-1/2 border border-black p-2 text-center">
                      {comboSteps[currIdx].arrangement.filter(({ op }) => op === "=").length === 0 && (
                        <p className="text-sm font-thin italic text-slate-400">Nothing equal to each other</p>
                      )}
                      {comboSteps[currIdx].arrangement
                        .filter(({ op }) => op == "=")
                        .map(({ var1, op, var2 }, idx) => (
                          <>
                            <p key={idx} className="">
                              <span
                                className={`font-bold ${var1.startsWith("__p") ? "text-blue-500" : var1.startsWith("__e") ? "text-green-500" : "text-orange-500"}`}
                              >
                                {var1}
                              </span>
                              <span className="mx-2">{op}</span>
                              <span
                                className={`font-bold ${var2.startsWith("__p") ? "text-blue-500" : var2.startsWith("__e") ? "text-green-500" : "text-orange-500"}`}
                              >
                                {var2}
                              </span>
                            </p>
                          </>
                        ))}
                    </td>
                    <td className="w-1/2 border border-black p-2 text-center">
                      {comboSteps[currIdx].arrangement.filter(({ op }) => op === "!=").length === 0 && (
                        <p className="text-sm font-thin italic text-slate-400">Everything equal to each other</p>
                      )}
                      {comboSteps[currIdx].arrangement
                        .filter(({ op }) => op == "!=")
                        .map(({ var1, op, var2 }, idx) => (
                          <>
                            <p key={idx} className="">
                              <span
                                className={`font-bold ${var1.startsWith("__p") ? "text-blue-500" : var1.startsWith("__e") ? "text-green-500" : "text-orange-500"}`}
                              >
                                {var1}
                              </span>
                              <span className="mx-2">{op}</span>
                              <span
                                className={`font-bold ${var2.startsWith("__p") ? "text-blue-500" : var2.startsWith("__e") ? "text-green-500" : "text-orange-500"}`}
                              >
                                {var2}
                              </span>
                            </p>
                          </>
                        ))}
                    </td>
                  </tr>
                </tbody>
                {/* <div className="w-[50%] text-center">
                </div>
                <div className="w-[50%] text-center">
                </div> */}
              </table>
            </div>
          )}
          <div className="mb-6">
            <div className="flex flex-row items-baseline">
              <h3 className="mr-2 text-lg font-bold">
                <span className="inline-block w-8">
                  T<sub>set</sub>{" "}
                </span>{" "}
                :{" "}
              </h3>
              {comboSteps[currIdx].f1.split(/(\s+|\b)/).map((word, index) => {
                // Check if the word starts with __p and apply blue color
                if (word.startsWith("__p")) {
                  return (
                    <span key={word + index} className="mx-1 font-bold text-blue-600">
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
                if (word === "ARR") {
                  return (
                    <span key={word + index} className="mx-1 text-lg italic text-slate-500">
                      Arr.
                    </span>
                  )
                }
                // Otherwise, return the word as is
                return <span key={word + index}>{word}</span>
              })}
              <p className="ml-auto text-lg font-bold">
                <span className="text-xl text-slate-500">⟹</span>
                <span
                  className={`mx-1 ${comboSteps[currIdx].result1 === "unsat" ? "text-red-500" : comboSteps[currIdx].result1 === "sat" ? "text-green-700" : ""}`}
                >
                  ({comboSteps[currIdx].result1})
                </span>
              </p>
            </div>
            <div className="flex flex-row items-baseline">
              <h3 className="mr-2 text-lg font-bold">
                <span className="inline-block w-8">
                  T<sub>Z</sub>{" "}
                </span>{" "}
                :{"  "}
              </h3>
              {comboSteps[currIdx].f2.split(/(\s+|\b)/).map((word, index) => {
                // Check if the word starts with __p and apply blue color
                if (word.startsWith("__p")) {
                  return (
                    <span key={word + index} className="mx-1 font-bold text-blue-600">
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
                if (word === "ARR") {
                  return (
                    <span key={word + index} className="mx-1 text-lg italic text-slate-500">
                      Arr.
                    </span>
                  )
                }
                // Otherwise, return the word as is
                return <span key={word + index}>{word}</span>
              })}
              <p className="ml-auto text-lg font-bold">
                <span className="text-xl text-slate-500">⟹</span>
                <span
                  className={`mx-1 ${comboSteps[currIdx].result2 === "unsat" ? "text-red-500" : comboSteps[currIdx].result2 === "sat" ? "text-green-700" : ""}`}
                >
                  ({comboSteps[currIdx].result2})
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <button className="rounded p-1 transition hover:opacity-60" onClick={() => setCurrIdx(currIdx === 0 ? comboSteps.length - 1 : currIdx - 1)}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <h6 className="text-center">
              {currIdx + 1} / {comboSteps.length}
            </h6>
            <button className="rounded p-1 transition hover:opacity-60" onClick={() => setCurrIdx(currIdx === comboSteps.length - 1 ? 0 : currIdx + 1)}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
