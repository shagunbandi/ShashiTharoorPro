# AI Text Refiner

A simple Chrome extension that helps you refine your text into clear, polished English. Just type your sentence and end it with `/ai` to instantly transform it.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Supported Editors](#supported-editors)
- [OpenAI API Key](#openai-api-key)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Instant Refinement**: Append `/ai` to the end of any sentence to see it automatically converted into polished English.
- **Seamless Experience**: Works on most text fields in your browser (see [Supported Editors](#supported-editors)).
- **Lightweight**: Minimal resource usage and simple UI.
- **Privacy-Friendly**: Processes only the text you specifically request to refine.

---

## Installation

### Option 1: Install from the Chrome Web Store (Upcoming)
1. Go to the **Chrome Web Store** and search for **AI Text Refiner** (once published).
2. Click on **Add to Chrome**.
3. Once installed, the extension icon will appear in your Chrome toolbar.

### Option 2: Load Unpacked (For Development or from Source)
1. Clone or download this repository.
2. Open **chrome://extensions** in your browser.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click on **Load unpacked** and select the folder containing this project.
5. The extension will appear in your Chrome toolbar.

---

## Usage

1. **Type a sentence** in any supported text input field.  
2. **Add `/ai` at the end** of your sentence.  
3. **Wait a moment** and watch as your sentence is instantly transformed into refined English!  

Example:

```
Before: This is an example text. /ai
After: This is an example text.

                           ↓
Refined: This is an exemplary statement.
```

> **Note**: The exact transformation may vary based on the extension’s AI logic.

---

## Supported Editors

- **ql-editor** (e.g., Quill-based editors)
- **cm-editor** (e.g., CodeMirror-based editors)
- **HTML input fields** (standard form inputs)

---

## OpenAI API Key

To use AI Text Refiner, you need to provide your **OpenAI API key** in the extension’s settings.

1. Create an OpenAI API key [here](https://platform.openai.com/account/api-keys).  
2. Open the extension's **Options** or **Settings** page.  
3. Paste your **OpenAI API Key** into the provided field.  
4. Save your settings to start refining your text!

---

## How It Works

1. The extension listens for text changes in **ql-editor**, **cm-editor**, or standard HTML input fields.
2. When it detects the `/ai` trigger, it sends the preceding text to an AI processing function or service via your **OpenAI API key**.
3. The AI returns a refined version of your text, which replaces the original sentence (excluding the `/ai`).

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the project.
2. **Create** your feature branch (`git checkout -b feature/newFeature`).
3. **Commit** your changes (`git commit -m 'Add some newFeature'`).
4. **Push** to the branch (`git push origin feature/newFeature`).
5. **Open a Pull Request**.

---

### Questions or Feedback?

If you have any questions or suggestions, feel free to [open an issue](../../issues) or contact the repository owner. We appreciate your feedback and contributions!
