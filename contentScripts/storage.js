// storage.js
let userAPIKey = null

// Load the key on initialization
chrome.storage.sync.get(['openAIKey'], (result) => {
  userAPIKey = result.openAIKey || null
  if (!userAPIKey) {
    console.warn('No OpenAI API key found in local storage.')
  }
})

// Provide a getter function so other modules can read the current key
export function getUserAPIKey() {
  return userAPIKey
}

// If needed, you can add setters or additional storage logic here
