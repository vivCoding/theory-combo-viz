export function findWordsNotStartingWithP(inputString: string) {
  // Regular expression to match words (letters and numbers, no isolated numbers)
  const regex = /\b[A-Za-z][A-Za-z0-9]*\b/g

  // Find all matches in the string
  const words = inputString.match(regex) || []

  // Filter out words that start with '__p'
  const result = words.filter((word) => !word.startsWith("__p"))

  return result
}

export function randomString() {
  return (Math.random() + 1).toString(36).substring(7)
}
