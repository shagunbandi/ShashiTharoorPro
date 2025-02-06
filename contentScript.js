/********************************
 *   PROMPT FOR OPENAI API KEY  *
 ********************************/

// Check localStorage for an existing API key
let userAPIKey = localStorage.getItem('openAIKey')
if (!userAPIKey) {
  userAPIKey = prompt('Please enter your OpenAI API key to use AI features:')
  if (userAPIKey) {
    localStorage.setItem('openAIKey', userAPIKey)
  }
}

/********************************
 *   CONFIG & HELPER FUNCTIONS  *
 ********************************/

// The (legacy) Completions endpoint for GPT-3.5-turbo-instruct or text-davinci-* models.
// If you use the Chat endpoint, you'd have to adjust the request body format.
const OPENAI_API_URL = 'https://api.openai.com/v1/completions'

/**
 * Calls OpenAI to improve the given text.
 * (Adjust the request as needed for your model and prompt style.)
 */
async function improveTextWithAI(originalText) {
  try {
    if (!userAPIKey) {
      // If user canceled the prompt or there's no key, just return original text
      console.warn('No OpenAI API key available. Returning original text.')
      return originalText
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAPIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Rewrite the following text to make it more professional and elaborate it:\n\n${originalText}\n\nImproved text:`,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const improvedText = data?.choices?.[0]?.text?.trim() || originalText
    return improvedText
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return originalText
  }
}

/********************************
 *  GET/SET TEXT FROM ANY EDITOR
 ********************************/

/**
 * Attempts to retrieve the *plain text* from an editor target:
 * - <input>, <textarea>
 * - Quill (.ql-editor)
 * - CodeMirror (.cm-editor / .cm-content)
 * - or any contentEditable element
 */
function getTextFromTarget(target) {
  const tagName = target.tagName ? target.tagName.toLowerCase() : ''
  if (tagName === 'input' || tagName === 'textarea') {
    return target.value
  }

  // If it's Quill, CodeMirror, or a generic contentEditable...
  // Many WYSIWYG editors set contentEditable on their main DOM node.
  if (
    target.classList &&
    (target.classList.contains('ql-editor') ||
      target.classList.contains('cm-editor') ||
      target.classList.contains('cm-content') ||
      target.isContentEditable)
  ) {
    return target.innerText
  }

  // Fallback: if nothing matched, return empty or try textContent
  return target.innerText || ''
}

/**
 * Sets the *plain text* back into the editor target.
 * This will remove custom formatting in Quill, CodeMirror, etc.
 * For advanced usage, you'd integrate each editor's own API instead.
 */
function setTextToTarget(target, newText) {
  const tagName = target.tagName ? target.tagName.toLowerCase() : ''
  if (tagName === 'input' || tagName === 'textarea') {
    target.value = newText
  } else if (
    target.classList &&
    (target.classList.contains('ql-editor') ||
      target.classList.contains('cm-editor') ||
      target.classList.contains('cm-content') ||
      target.isContentEditable)
  ) {
    target.innerText = newText
  }
  // Fallback: do nothing for unknown types
}

/********************************
 *  TOOLTIP CREATION / REMOVAL  *
 ********************************/

/**
 * Create a small tooltip near the target element showing the improved text.
 */
function showTooltip(target, improvedText) {
  removeTooltip()

  const tooltip = document.createElement('div')
  tooltip.id = 'ai-tooltip'
  tooltip.style.position = 'absolute'
  tooltip.style.background = '#fff'
  tooltip.style.border = '1px solid #ccc'
  tooltip.style.padding = '8px'
  tooltip.style.borderRadius = '6px'
  tooltip.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)'
  tooltip.style.zIndex = '999999'
  tooltip.style.fontFamily = 'sans-serif'
  tooltip.textContent = improvedText

  document.body.appendChild(tooltip)
  positionTooltip(target, tooltip)
  return tooltip
}

/**
 * Position the tooltip near (above/below) the target element.
 */
function positionTooltip(target, tooltip) {
  const rect = target.getBoundingClientRect()
  const tooltipHeight = tooltip.offsetHeight

  // Try above the element
  const top = rect.top + window.scrollY - tooltipHeight - 10
  const left = rect.left + window.scrollX

  // If there's no space above, place it below
  const finalTop = top < 0 ? rect.bottom + window.scrollY + 10 : top

  tooltip.style.top = `${finalTop}px`
  tooltip.style.left = `${left}px`
}

/** Remove any existing tooltip from the DOM. */
function removeTooltip() {
  const existing = document.getElementById('ai-tooltip')
  if (existing) {
    existing.remove()
  }
}

/********************************
 *      GLOBAL STATE MGMT       *
 ********************************/
// We store a “suggestion” object if we have an active improved text
let activeSuggestion = null
/*
activeSuggestion = {
  target: HTMLElement  (the input or .ql-editor, etc.),
  originalText: string,
  improvedText: string,
  tooltipEl: HTMLElement (the tooltip div)
};
*/

/********************************
 *  MAIN LOGIC: DETECT "/ai"    *
 ********************************/

/**
 * Listen for /ai in any editable surface. We'll do this on keyup
 * so we see the typed character.  If found, we fetch improved text and display a tooltip.
 */
function handleKeyUp(event) {
  const target = event.target
  if (!target) return

  const text = getTextFromTarget(target)
  if (text.endsWith('/ai')) {
    // Remove the "/ai" portion
    const textWithoutCommand = text.slice(0, -3).trimEnd()
    fetchAndShowSuggestion(target, textWithoutCommand)
  }
}

/**
 * Fetch improved text from AI, show tooltip, and store suggestion state.
 */
function fetchAndShowSuggestion(target, originalText) {
  improveTextWithAI(originalText).then((improvedText) => {
    const tooltipEl = showTooltip(target, improvedText)

    // Set global suggestion info
    activeSuggestion = {
      target,
      originalText,
      improvedText,
      tooltipEl,
    }
  })
}

/********************************
 * HANDLE ACCEPT/REJECT BY KEYS *
 ********************************/

/**
 * Listen for keydown events to accept or dismiss the suggestion:
 * - Tab => Accept
 * - Escape => Dismiss
 * - Any normal typing => Dismiss
 */
function handleKeyDown(event) {
  if (!activeSuggestion) return // No active suggestion to handle

  const { target, improvedText } = activeSuggestion

  // If user presses Tab => Accept
  if (event.key === 'Tab') {
    // Prevent focus change
    event.preventDefault()
    acceptSuggestion(target, improvedText)
    return
  }

  // If user presses Escape => Reject
  if (event.key === 'Escape') {
    rejectSuggestion()
    return
  }

  // If user types normal characters => reject
  if (isTypingCharacter(event)) {
    rejectSuggestion()
  }
}

/**
 * Returns true if the keydown event is a "typing character" (letters, digits, punctuation)
 * vs. a control key (Shift, Ctrl, Alt, Arrow keys, etc.).
 */
function isTypingCharacter(event) {
  // Common non-typing keys we want to ignore
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
    'Enter', // optionally handle if you want accept on Enter
  ])

  return !ignoreKeys.has(event.key)
}

/********************************
 *  ACCEPT / REJECT SUGGESTION  *
 ********************************/
function acceptSuggestion(target, improvedText) {
  setTextToTarget(target, improvedText)
  removeTooltip()
  activeSuggestion = null
}

function rejectSuggestion() {
  removeTooltip()
  activeSuggestion = null
}

/********************************
 *         EVENT LISTENERS      *
 ********************************/
document.addEventListener('keyup', handleKeyUp, true)
document.addEventListener('keydown', handleKeyDown, true)
