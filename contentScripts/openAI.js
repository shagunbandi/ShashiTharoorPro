// openAI.js
import { getUserAPIKey } from './storage.js'

const OPENAI_COMPLETION_URL = 'https://api.openai.com/v1/completions'

// We might create a small wrapper that returns the entire response
async function callOpenAI(promptText) {
  const apiKey = getUserAPIKey()
  if (!apiKey) {
    console.warn('No OpenAI API key, returning original text.')
    return null
  }

  try {
    const response = await fetch(OPENAI_COMPLETION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: promptText,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (data.error) {
      console.error('OpenAI API Error:', data.error)
      return null
    }
    // Return the text from the first choice if it exists
    return data.choices?.[0]?.text?.trim() || null
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return null
  }
}

export async function improveText(originalText) {
  const prompt = `Rewrite the following text to make it more professional:\n\n${originalText}\n\nImproved text:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function elaborateText(originalText) {
  // For example, instruct GPT to elaborate or add detail
  const prompt = `Elaborate on the following text with more detail:\n\n${originalText}\n\nElaborated text:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function translateText(originalText, language) {
  // For example: "Translate the following text into Spanish: <text>"
  const prompt = `Translate the following text into ${language}:\n\n${originalText}\n\nTranslation:`
  const result = await callOpenAI(prompt)
  return result || originalText
}
