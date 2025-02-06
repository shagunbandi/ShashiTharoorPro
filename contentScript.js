/********************************
 *  STORAGE & GLOBAL API KEY    *
 ********************************/
let userAPIKey = null

// We'll load the key once at the start of the script
// (If the user changes it, they'll need to refresh the tab or rely on another approach.)
chrome.storage.local.get(['openAIKey'], (result) => {
  userAPIKey = result.openAIKey || null
})

/********************************
 *   CONFIG & HELPER FUNCTIONS  *
 ********************************/

const OPENAI_API_URL = 'https://api.openai.com/v1/completions'

// Calls OpenAI to improve the given text (only if we have an API key)
async function improveTextWithAI(originalText) {
  if (!userAPIKey) {
    console.warn(
      'No OpenAI API key found in local storage. Cannot improve text.',
    )
    return originalText
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAPIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Rewrite the following text to make it more professional:\n\n${originalText}\n\nImproved text:`,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (data.error) {
      console.error('OpenAI API Error:', data.error)
      return originalText
    }
    const improvedText = data.choices?.[0]?.text?.trim() || originalText
    return improvedText
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return originalText
  }
}

/********************************
 *  GET/SET TEXT FROM ANY EDITOR
 ********************************/

function getTextFromTarget(target) {
  const tagName = target.tagName ? target.tagName.toLowerCase() : ''
  if (tagName === 'input' || tagName === 'textarea') {
    return target.value
  }

  // Quill, CodeMirror, or generic contentEditable
  if (target.classList) {
    if (
      target.classList.contains('ql-editor') ||
      target.classList.contains('cm-editor') ||
      target.classList.contains('cm-content') ||
      target.isContentEditable
    ) {
      return target.innerText
    }
  }

  // Fallback
  return target.innerText || ''
}

function setTextToTarget(target, newText) {
  const tagName = target.tagName ? target.tagName.toLowerCase() : ''
  if (tagName === 'input' || tagName === 'textarea') {
    target.value = newText
  } else if (target.classList) {
    if (
      target.classList.contains('ql-editor') ||
      target.classList.contains('cm-editor') ||
      target.classList.contains('cm-content') ||
      target.isContentEditable
    ) {
      target.innerText = newText
    }
  }
}

/********************************
 *  TOOLTIP CREATION / REMOVAL  *
 ********************************/

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

function positionTooltip(target, tooltip) {
  const rect = target.getBoundingClientRect()
  const tooltipHeight = tooltip.offsetHeight
  const top = rect.top + window.scrollY - tooltipHeight - 10
  const left = rect.left + window.scrollX
  const finalTop = top < 0 ? rect.bottom + window.scrollY + 10 : top
  tooltip.style.top = `${finalTop}px`
  tooltip.style.left = `${left}px`
}

function removeTooltip() {
  const existing = document.getElementById('ai-tooltip')
  if (existing) existing.remove()
}

/********************************
 *      GLOBAL STATE MGMT       *
 ********************************/
let activeSuggestion = null
/* 
activeSuggestion = {
  target: HTMLElement,
  originalText: string,
  improvedText: string,
  tooltipEl: HTMLElement
}
*/

/********************************
 *  MAIN LOGIC: DETECT "/ai"    *
 ********************************/

function handleKeyUp(event) {
  const target = event.target
  if (!target) return

  const text = getTextFromTarget(target)
  if (text.endsWith('/ai')) {
    // Strip off "/ai"
    const textWithoutCommand = text.slice(0, -3).trimEnd()
    fetchAndShowSuggestion(target, textWithoutCommand)
  }
}

function fetchAndShowSuggestion(target, originalText) {
  improveTextWithAI(originalText).then((improvedText) => {
    const tooltipEl = showTooltip(target, improvedText)
    activeSuggestion = { target, originalText, improvedText, tooltipEl }
  })
}

/********************************
 * HANDLE ACCEPT/REJECT BY KEYS *
 ********************************/

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

  // If user is typing normal characters => reject
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

/********************************
 *         EVENT LISTENERS      *
 ********************************/
document.addEventListener('keyup', handleKeyUp, true)
document.addEventListener('keydown', handleKeyDown, true)
