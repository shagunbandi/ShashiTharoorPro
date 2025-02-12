// tooltip.js

import { improveText, elaborateText } from './openAI.js'
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

  const professionalBtn = document.createElement('button')
  professionalBtn.textContent = 'Make Professional'
  professionalBtn.style.padding = '6px 12px'
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

  buttonContainer.appendChild(professionalBtn)
  buttonContainer.appendChild(elaborateBtn)

  // Add accept/reject buttons container
  const actionContainer = document.createElement('div')
  actionContainer.style.display = 'flex'
  actionContainer.style.gap = '8px'
  actionContainer.style.marginTop = '8px'
  actionContainer.style.justifyContent = 'space-between'

  const helpText = document.createElement('div')
  helpText.style.color = '#666'
  helpText.style.fontSize = '12px'
  helpText.textContent = 'Press Tab to accept, Esc to reject'

  const acceptBtn = document.createElement('button')
  acceptBtn.textContent = 'Accept (Tab)'
  acceptBtn.style.padding = '6px 12px'
  acceptBtn.style.backgroundColor = '#4CAF50'
  acceptBtn.style.color = 'white'
  acceptBtn.style.border = 'none'
  acceptBtn.style.borderRadius = '4px'
  acceptBtn.onclick = () => {
    const newText = improvedTextArea.value
    setTextToTarget(target, newText)
    removeTooltip()
  }

  const rejectBtn = document.createElement('button')
  rejectBtn.textContent = 'Reject (Esc)'
  rejectBtn.style.padding = '6px 12px'
  rejectBtn.style.backgroundColor = '#f44336'
  rejectBtn.style.color = 'white'
  rejectBtn.style.border = 'none'
  rejectBtn.style.borderRadius = '4px'
  rejectBtn.onclick = () => {
    removeTooltip()
  }

  actionContainer.appendChild(helpText)
  actionContainer.appendChild(acceptBtn)
  actionContainer.appendChild(rejectBtn)

  tooltip.appendChild(originalTextArea)
  tooltip.appendChild(improvedTextArea)
  tooltip.appendChild(buttonContainer)
  tooltip.appendChild(actionContainer)

  document.body.appendChild(tooltip)
  positionTooltip(target, tooltip)

  // Add keyboard event listeners
  tooltip.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const newText = improvedTextArea.value
      setTextToTarget(target, newText)
      removeTooltip()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      removeTooltip()
    }
  })

  return tooltip
}
