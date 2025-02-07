// tooltip.js

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
