// domUtils.js

export function getTextFromTarget(target) {
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

export function setTextToTarget(target, newText) {
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
