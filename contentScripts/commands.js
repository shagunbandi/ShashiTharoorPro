// commands.js

// The object we return when we parse a command
// interface ParsedCommand {
//   commandType: 'improve' | 'elaborate' | 'translate' | null
//   textToProcess: string
//   language?: string    // only for translate
//   replacedRange?: [startIndex, endIndex] // if using partial text
// }

export function parseCommand(fullText) {
  // Trim trailing whitespace to see if it ends with a recognized pattern
  const trimmedText = fullText.trimEnd()

  // 1) Check for block-based patterns: /start ... /end /ai  OR  /s ... /e /ai
  // We'll search for these patterns first. If found, handle that text only.
  let blockMatch = matchBlockSyntax(trimmedText)
  if (blockMatch) {
    return blockMatch
  }

  // 2) Otherwise, check for simpler commands at the end of text
  //    e.g. "Hello world /ai" or "Hello /elaborate" or "Hello /translate Spanish"
  let simpleMatch = matchSimpleSyntax(trimmedText)
  if (simpleMatch) {
    return simpleMatch
  }

  // If none match, return null -> no recognized command
  return null
}

/**
 * For matches like:
 *   /start <some text> /end /ai
 *   /s <some text> /e /elaborate
 *   /s <some text> /e /translate Spanish
 */
function matchBlockSyntax(text) {
  // We'll define a regex for the capturing group:
  //   either "/start" or "/s", then (some text in between), then "/end" or "/e", then one of /ai | /elaborate | /translate ...
  const blockRegex =
    /(\/start|\/s)([\s\S]*?)(\/end|\/e)\s(\/ai|\/elaborate|\/translate)(\s+[^\s]+)?$/i
  // Explanation:
  //   (\/start|\/s) => matches /start OR /s
  //   ([\s\S]*?) => capture everything (non-greedy) until next group
  //   (\/end|\/e) => matches /end OR /e
  //   \s => a space
  //   (\/ai|\/elaborate|\/translate) => the main command
  //   (\s+[^\s]+)? => optionally capture a language argument if /translate is used

  let match = text.match(blockRegex)
  if (!match) return null

  const commandKeyword = match[4].toLowerCase() // /ai, /elaborate, /translate
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
      commandType = 'translate'
      break
  }

  if (commandType === 'translate') {
    // If there's a language chunk, e.g. " /translate Spanish"
    // match[5] might look like " Spanish"
    if (match[5]) {
      language = match[5].trim()
    } else {
      language = 'English' // or default, if not provided
    }
  }

  // The second capture group is the text we want to transform
  // e.g. /s Hello this is text /e /ai => match[2] = " Hello this is text "
  let textToProcess = match[2].trim()

  // Identify the exact replaced range so we can remove it from the original
  // Not strictly required if we want to fully replace the entire text,
  // but let's keep it in case we only want to replace the portion
  const startIndex = match.index
  const endIndex = match.index + match[0].length

  return {
    commandType,
    textToProcess,
    language,
    replacedRange: [startIndex, endIndex],
  }
}

/**
 * For simpler commands that appear at the end of the entire text:
 *   "some text here /ai"
 *   "some text here /elaborate"
 *   "some text here /translate Spanish"
 */
function matchSimpleSyntax(text) {
  // We'll define a simpler pattern: (.*) (/(ai|elaborate|translate)(\s+\S+)?)$
  //   capture all text up until the last space
  //   then slash + command + optional language
  const regex = /^(.*)(\/(ai|elaborate|translate)(\s+[^\s]+)?)$/i
  let match = text.match(regex)
  if (!match) return null

  // match[1] => the text before the command
  // match[2] => the entire slash+command (e.g. "/translate Spanish")
  // match[3] => just "ai" or "elaborate" or "translate"
  // match[4] => possibly the language " Spanish"
  const rawCommand = match[3].toLowerCase()
  let commandType = null
  let language = undefined

  switch (rawCommand) {
    case 'ai':
      commandType = 'improve'
      break
    case 'elaborate':
      commandType = 'elaborate'
      break
    case 'translate':
      commandType = 'translate'
      break
  }

  if (commandType === 'translate') {
    // e.g. match[4] => " Spanish"
    if (match[4]) {
      language = match[4].trim()
    } else {
      language = 'English'
    }
  }

  return {
    commandType,
    textToProcess: match[1].trim(),
    language,
    // Since the user typed "some text /ai" at the very end, the replaced range
    // is basically the entire length if we want to replace it all,
    // or we can note the end indices. Up to you how you handle partial replacements.
    replacedRange: [0, text.length],
  }
}
