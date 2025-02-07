// main.js
import { parseCommand } from './commands.js'
import { improveText, elaborateText, translateText } from './openAI.js'
import { getTextFromTarget, setTextToTarget } from './domUtils.js'
import { showTooltip, removeTooltip } from './tooltip.js'
// If you have a storage module, import it if needed:
import { getUserAPIKey } from './storage.js'

let activeSuggestion = null
// activeSuggestion = {
//   target: HTMLElement,
//   originalText: string,
//   improvedText: string,
//   tooltipEl: HTMLElement
// }

document.addEventListener('keyup', handleKeyUp, true)
document.addEventListener('keydown', handleKeyDown, true)

function handleKeyUp(event) {
  const target = event.target
  if (!target) return

  const text = getTextFromTarget(target)
  // Attempt to parse for any recognized command
  const parsed = parseCommand(text)
  if (parsed) {
    // If we have a command, let's call the relevant OpenAI function
    // “parsed.textToProcess” is the substring we want to transform
    fetchAndShowSuggestion(target, text, parsed)
  }
}

async function fetchAndShowSuggestion(target, fullText, parsedCommand) {
  const { commandType, textToProcess, language, replacedRange } = parsedCommand
  let improved = textToProcess

  try {
    if (commandType === 'improve') {
      improved = await improveText(textToProcess)
    } else if (commandType === 'elaborate') {
      improved = await elaborateText(textToProcess)
    } else if (commandType === 'translate') {
      improved = await translateText(textToProcess, language)
    }
  } catch (err) {
    console.error('Error during OpenAI call:', err)
    // fallback to original
    improved = textToProcess
  }

  // Show the improved text in a tooltip
  const tooltipEl = showTooltip(target, improved)

  // Save to global state
  activeSuggestion = {
    target,
    originalText: fullText,
    improvedText: replaceTextInRange(fullText, replacedRange, improved),
    tooltipEl,
  }
}

/**
 * Replace the substring in [start,end] with the improved text
 * If no range is given, replace the entire text (or do what you want).
 */
function replaceTextInRange(fullText, range, replacement) {
  if (!range) {
    return replacement
  }
  const [start, end] = range
  return fullText.slice(0, start) + replacement + fullText.slice(end)
}

function handleKeyDown(event) {
  if (!activeSuggestion) return

  const { target, improvedText } = activeSuggestion

  // Tab => accept
  if (event.key === 'Tab') {
    event.preventDefault()
    acceptSuggestion(target, improvedText)
    return
  }

  // Escape => reject
  if (event.key === 'Escape') {
    rejectSuggestion()
    return
  }

  // If user is typing a normal character => reject
  if (isTypingCharacter(event)) {
    rejectSuggestion()
  }
}

function isTypingCharacter(event) {
  const ignoreKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Shift',
    'Control',
    'Alt',
    'Meta',
    'CapsLock',
    'Tab', // handled separately
    'Escape', // handled separately
    'Enter',
  ])
  return !ignoreKeys.has(event.key)
}

function acceptSuggestion(target, improvedText) {
  setTextToTarget(target, improvedText)
  removeTooltip()
  activeSuggestion = null
}

function rejectSuggestion() {
  removeTooltip()
  activeSuggestion = null
}
