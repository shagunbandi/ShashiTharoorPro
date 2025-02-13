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

async function callOpenAIAPI(endpoint, data) {
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer YOUR_API_KEY`,
    },
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function improveText(originalText) {
  const prompt = `Rewrite the following text to make it more professional:\n\n${originalText}\n\nImproved text:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function elaborateText(originalText) {
  // For example, instruct GPT to elaborate or add detail
  const prompt = `Elaborate on the following text with more detail but keep it to the point. Don't write more than thrice the words there were initially.:\n\n${originalText}\n\nElaborated text:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function translateText(originalText, language) {
  // For example: "Translate the following text into Spanish: <text>"
  const prompt = `Translate the following text into ${language}:\n\n${originalText}\n\nTranslation:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function summarizeText(originalText) {
  const prompt = `Summarize the following text:\n\n${originalText}\n\nSummary:`
  const result = await callOpenAI(prompt)
  return result || originalText
}

export async function getExpertAdvice(context, query) {
  const prompt = `Question: ${query}\n\nPlease provide an expert advice about this question.`
  const result = await callOpenAI(prompt)
  return result || 'Sorry, unable to get expert advice at this time.'
}
