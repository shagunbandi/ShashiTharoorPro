document.addEventListener('DOMContentLoaded', () => {
  const openAIKeyInput = document.getElementById('openAIKeyInput')
  const saveKeyBtn = document.getElementById('saveKeyBtn')

  // 1. Load any previously saved key
  chrome.storage.local.get(['openAIKey'], (result) => {
    if (result.openAIKey) {
      openAIKeyInput.value = result.openAIKey
    }
  })

  // 2. Save the key when the user clicks "Save"
  saveKeyBtn.addEventListener('click', () => {
    const key = openAIKeyInput.value.trim()
    if (key) {
      chrome.storage.local.set({ openAIKey: key }, () => {
        alert('API key saved successfully!')
      })
    } else {
      alert('Please enter a valid API key.')
    }
  })
})
