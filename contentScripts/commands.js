// commands.js

// The object we return when we parse a command
// interface ParsedCommand {
//   commandType: 'improve' | 'elaborate' | 'translate' | null
//   textToProcess: string
//   language?: string    // only for translate
//   replacedRange?: [startIndex, endIndex] // if using partial text
// }

export function parseCommand(fullText) {
  const trimmedText = fullText.trimEnd()

  // 1) Block syntax: /start ... /end /ai  OR  /s ... /e /t ...
  const blockMatch = matchBlockSyntax(trimmedText)
  if (blockMatch) return blockMatch

  // 2) Simple suffix for /ai or /elaborate only
  const simpleMatch = matchSimpleSyntax(trimmedText)
  if (simpleMatch) return simpleMatch

  // 3) Translate with trailing slash (either /translate or /t)
  const slashEndTranslateMatch = matchTranslateSlashEnd(trimmedText)
  if (slashEndTranslateMatch) return slashEndTranslateMatch

  // No recognized command
  return null
}

/**
 *  BLOCK SYNTAX
 *  e.g.:
 *    /start <some text> /end /ai
 *    /s <some text> /e /elaborate
 *    /s <some text> /e /translate Spanish
 *    /s <some text> /e /t Spanish
 */
function matchBlockSyntax(text) {
  // Regex now includes (\/translate|\/t)
  // So /t or /translate can appear after /end /e
  // e.g. /s Hello /e /t Spanish
  const blockRegex =
    /(\/start|\/s)([\s\S]*?)(\/end|\/e)\s(\/ai|\/elaborate|\/translate|\/t)(\s+[^\s]+)?$/i

  const match = text.match(blockRegex)
  if (!match) return null

  const commandKeyword = match[4].toLowerCase() // e.g. /ai, /elaborate, /translate, /t
  let commandType = null
  let language = undefined

  switch (commandKeyword) {
    case '/ai':
      commandType = 'improve'
      break
    case '/elaborate':
      commandType = 'elaborate'
      break
    case '/translate':
    case '/t': // Treat both as translate
      commandType = 'translate'
      break
    default:
      return null
  }

  // If it's translate or t, we might have a language chunk
  if (commandType === 'translate') {
    // e.g. " /translate Spanish"
    if (match[5]) {
      language = match[5].trim()
    } else {
      language = 'English'
    }
  }

  const textToProcess = match[2].trim()
  const startIndex = match.index
  const endIndex = startIndex + match[0].length

  return {
    commandType,
    textToProcess,
    language,
    replacedRange: [startIndex, endIndex],
  }
}

/**
 * SIMPLE SUFFIX for /ai or /elaborate only
 * e.g. "some text /ai", "some text /elaborate"
 *
 * We explicitly exclude '/translate' or '/t' here,
 * so that translate always requires a trailing slash.
 */
function matchSimpleSyntax(text) {
  // This pattern captures only /ai or /elaborate at the end
  // e.g. "Hello world /ai"
  const regex = /^(.*)(\/(ai|elaborate))$/i
  const match = text.match(regex)
  if (!match) return null

  const rawCommand = match[3].toLowerCase() // "ai" or "elaborate"
  let commandType = null

  switch (rawCommand) {
    case 'ai':
      commandType = 'improve'
      break
    case 'elaborate':
      commandType = 'elaborate'
      break
    default:
      return null
  }

  return {
    commandType,
    textToProcess: match[1].trim(),
    replacedRange: [0, text.length],
  }
}

/**
 * TRAILING-SLASH TRANSLATE
 * e.g.:
 *   "Hello world /translate Spanish/"
 *   "some text /t French/"
 *
 * We look for either "/translate" or "/t",
 * then a space, then the language, then a trailing slash.
 */
function matchTranslateSlashEnd(text) {
  // (?:translate|t) means match "translate" OR "t"
  const slashEndRegex = /^(.*)\/(?:translate|t)\s+([^/]+)\/$/i
  const match = text.match(slashEndRegex)
  if (!match) return null

  const textToProcess = match[1].trim()
  const language = match[2].trim()

  return {
    commandType: 'translate',
    textToProcess,
    language,
    replacedRange: [0, text.length],
  }
}
