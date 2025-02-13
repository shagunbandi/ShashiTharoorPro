// tooltip.js

import { improveText, elaborateText, getExpertAdvice } from './openAI.js'
import { setTextToTarget } from './domUtils.js'

export function showTooltip(target, text) {
  removeTooltip() // remove any existing tooltip

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
  tooltip.textContent = text

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

export function removeTooltip() {
  const existing = document.getElementById('ai-tooltip')
  if (existing) {
    existing.remove()
  }
}

export function showInteractiveTooltip(target, originalText) {
  removeTooltip() // remove any existing tooltip

  const tooltip = document.createElement('div')
  tooltip.id = 'ai-tooltip'
  tooltip.style.position = 'absolute'
  tooltip.style.background = '#fff'
  tooltip.style.border = '1px solid #ccc'
  tooltip.style.padding = '12px'
  tooltip.style.borderRadius = '8px'
  tooltip.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)'
  tooltip.style.zIndex = '999999'
  tooltip.style.fontFamily = 'sans-serif'
  tooltip.style.minWidth = '300px'

  // Create content
  const originalTextArea = document.createElement('textarea')
  originalTextArea.value = originalText
  originalTextArea.readOnly = true
  originalTextArea.style.width = '100%'
  originalTextArea.style.marginBottom = '8px'
  originalTextArea.style.padding = '4px'

  const improvedTextArea = document.createElement('textarea')
  improvedTextArea.value = 'Improved text will appear here...'
  improvedTextArea.readOnly = true
  improvedTextArea.style.width = '100%'
  improvedTextArea.style.marginBottom = '8px'
  improvedTextArea.style.padding = '4px'

  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.gap = '8px'

  // Create accept/reject buttons container FIRST
  const actionContainer = document.createElement('div')
  actionContainer.style.display = 'flex'
  actionContainer.style.gap = '8px'
  actionContainer.style.marginTop = '8px'
  actionContainer.style.justifyContent = 'space-between'

  const helpText = document.createElement('div')
  helpText.style.color = '#666'
  helpText.style.fontSize = '12px'
  helpText.textContent = 'Press Tab to accept, Esc to reject'

  // Create accept button early
  const acceptBtn = document.createElement('button')
  acceptBtn.textContent = 'Accept (Tab)'
  acceptBtn.style.padding = '6px 12px'
  acceptBtn.style.backgroundColor = '#2E7D32'
  acceptBtn.style.color = 'white'
  acceptBtn.style.border = 'none'
  acceptBtn.style.borderRadius = '4px'
  acceptBtn.style.cursor = 'pointer'
  acceptBtn.onclick = () => {
    const newText = improvedTextArea.value
    setTextToTarget(target, newText)
    removeTooltip()
  }

  const rejectBtn = document.createElement('button')
  rejectBtn.textContent = 'Reject (Esc)'
  rejectBtn.style.padding = '6px 12px'
  rejectBtn.style.backgroundColor = '#C62828'
  rejectBtn.style.color = 'white'
  rejectBtn.style.border = 'none'
  rejectBtn.style.borderRadius = '4px'
  rejectBtn.style.cursor = 'pointer'
  rejectBtn.onclick = () => {
    removeTooltip()
  }

  actionContainer.appendChild(helpText)
  actionContainer.appendChild(acceptBtn)
  actionContainer.appendChild(rejectBtn)

  // Now create the action buttons
  const professionalBtn = document.createElement('button')
  professionalBtn.textContent = 'Make Professional'
  professionalBtn.style.padding = '6px 12px'
  professionalBtn.style.backgroundColor = '#1565C0'
  professionalBtn.style.color = 'white'
  professionalBtn.style.border = 'none'
  professionalBtn.style.borderRadius = '4px'
  professionalBtn.style.cursor = 'pointer'
  professionalBtn.onclick = async () => {
    improvedTextArea.value = 'Processing...'
    try {
      const improved = await improveText(originalText)
      improvedTextArea.value =
        improved || 'Failed to improve text. Please try again.'
    } catch (error) {
      console.error('Error improving text:', error)
      improvedTextArea.value = 'An error occurred. Please try again.'
    }
  }

  const elaborateBtn = document.createElement('button')
  elaborateBtn.textContent = 'Elaborate'
  elaborateBtn.style.padding = '6px 12px'
  elaborateBtn.style.backgroundColor = '#6A1B9A'
  elaborateBtn.style.color = 'white'
  elaborateBtn.style.border = 'none'
  elaborateBtn.style.borderRadius = '4px'
  elaborateBtn.style.cursor = 'pointer'
  elaborateBtn.onclick = async () => {
    improvedTextArea.value = 'Processing...'
    try {
      const improved = await elaborateText(originalText)
      improvedTextArea.value =
        improved || 'Failed to elaborate text. Please try again.'
    } catch (error) {
      console.error('Error elaborating text:', error)
      improvedTextArea.value = 'An error occurred. Please try again.'
    }
  }

  // Add expert advice button
  const expertAdviceBtn = document.createElement('button')
  expertAdviceBtn.textContent = 'Expert Advice'
  expertAdviceBtn.style.padding = '6px 12px'
  expertAdviceBtn.style.backgroundColor = '#2196F3'
  expertAdviceBtn.style.color = 'white'
  expertAdviceBtn.style.border = 'none'
  expertAdviceBtn.style.borderRadius = '4px'
  expertAdviceBtn.style.cursor = 'pointer'
  expertAdviceBtn.onclick = () => {
    // Hide other elements
    originalTextArea.style.display = 'none'
    improvedTextArea.style.display = 'none'
    buttonContainer.style.display = 'none'

    // Create and show expert advice elements
    const expertContainer = document.createElement('div')
    expertContainer.style.marginBottom = '12px'

    const queryInput = document.createElement('textarea')
    queryInput.placeholder = 'Ask your question here...'
    queryInput.value = originalText
    queryInput.style.width = '100%'
    queryInput.style.marginBottom = '8px'
    queryInput.style.padding = '4px'
    queryInput.style.minHeight = '60px'

    const adviceOutput = document.createElement('textarea')
    adviceOutput.readOnly = true
    adviceOutput.value = 'Expert advice will appear here...'
    adviceOutput.style.width = '100%'
    adviceOutput.style.marginBottom = '8px'
    adviceOutput.style.padding = '4px'
    adviceOutput.style.minHeight = '100px'

    // Update the accept button handler for expert advice mode
    acceptBtn.onclick = () => {
      const newText =
        adviceOutput.style.display === 'none'
          ? improvedTextArea.value
          : adviceOutput.value
      setTextToTarget(target, newText)
      removeTooltip()
    }

    // Update the keyboard event listener for expert advice mode
    tooltip.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (adviceOutput.value === 'Expert advice will appear here...') {
          // If advice hasn't been requested yet, trigger get advice
          getAdviceBtn.click()
        } else {
          // If advice is already shown, accept it
          const newText = adviceOutput.value
          setTextToTarget(target, newText)
          removeTooltip()
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        removeTooltip()
      }
    })

    const getAdviceBtn = document.createElement('button')
    getAdviceBtn.textContent = 'Get Advice'
    getAdviceBtn.style.padding = '6px 12px'
    getAdviceBtn.style.backgroundColor = '#0277BD'
    getAdviceBtn.style.color = 'white'
    getAdviceBtn.style.border = 'none'
    getAdviceBtn.style.borderRadius = '4px'
    getAdviceBtn.style.cursor = 'pointer'
    getAdviceBtn.onclick = async () => {
      adviceOutput.value = 'Processing...'
      try {
        const advice = await getExpertAdvice(originalText, queryInput.value)
        adviceOutput.value = advice
      } catch (error) {
        console.error('Error getting expert advice:', error)
        adviceOutput.value = 'An error occurred. Please try again.'
      }
    }

    const backBtn = document.createElement('button')
    backBtn.textContent = '← Back'
    backBtn.style.padding = '6px 12px'
    backBtn.style.backgroundColor = '#757575'
    backBtn.style.color = 'white'
    backBtn.style.border = 'none'
    backBtn.style.borderRadius = '4px'
    backBtn.style.cursor = 'pointer'
    backBtn.style.marginRight = '8px'
    backBtn.onclick = () => {
      expertContainer.remove()
      originalTextArea.style.display = ''
      improvedTextArea.style.display = ''
      buttonContainer.style.display = ''
      // Reset accept button handler to original behavior
      acceptBtn.onclick = () => {
        const newText = improvedTextArea.value
        setTextToTarget(target, newText)
        removeTooltip()
      }
    }

    expertContainer.appendChild(backBtn)
    expertContainer.appendChild(queryInput)
    expertContainer.appendChild(getAdviceBtn)
    expertContainer.appendChild(adviceOutput)

    tooltip.insertBefore(expertContainer, actionContainer)
  }

  buttonContainer.appendChild(professionalBtn)
  buttonContainer.appendChild(elaborateBtn)
  buttonContainer.appendChild(expertAdviceBtn)

  tooltip.appendChild(originalTextArea)
  tooltip.appendChild(improvedTextArea)
  tooltip.appendChild(buttonContainer)
  tooltip.appendChild(actionContainer)

  document.body.appendChild(tooltip)
  positionTooltip(target, tooltip)

  return tooltip
}
