---
title: Real Crystyl Translator
emoji: 💬
colorFrom: blue
colorTo: yellow
sdk: static
pinned: false
---

# Crystyl Translator

Crystyl Translator is a tiny, mobile-first Progressive Web App that helps with casual text-message translation between English and everyday Mexican Spanish. It was built as a personal “love-letter translator” for Crystyl, with automatic language detection, one-tap copying, a blue-and-gold sparkle theme, and a rotating encouragement quote every time the app opens.

Live app: https://crystyl-translator.pplx.app

## Description

This project is designed for real-life bilingual texting between a native English speaker and a Mexican woman who speaks English as a second language. The app keeps the interface intentionally simple: paste or type a message, tap **Translate**, then tap **Copy** to paste the translated response into iMessage.

The experience is intentionally warm and personal rather than generic. The visual style uses Chinese Blue, gold, soft cream surfaces, and subtle sparkles. The title, copy, icon, and daily quote treatment all reference Crystyl directly. On iPhone, the app can be saved to the Home Screen and launched like a standalone app.

## Key features

- **Automatic language detection**: Detects whether the input is English or Spanish and translates into the opposite language.
- **Mexican Spanish preference**: Uses `en-US ↔ es-MX` language pairs to bias output toward everyday Mexican Spanish.
- **Text-message-friendly tone**: Optimized for short, casual, affectionate, everyday messages instead of formal translation.
- **Copy button**: Copies the translated output for quick paste into iMessage.
- **Clear button**: Clears the input, output, status, and detected-language indicator.
- **Blank on every open**: The input field is explicitly cleared when the app loads.
- **No saved message history**: No `localStorage`, `sessionStorage`, `indexedDB`, cookies, database, analytics, or login.
- **Rotating quote card**: Shows a different affirmation for Crystyl each time the app opens.
- **NLT Bible references**: Bible entries use short NLT excerpts with citations; movie, country, and pop entries are original “inspired by” affirmations rather than copyrighted lyrics or film dialogue.
- **iPhone Home Screen support**: Includes PWA manifest, Apple touch icon, theme color, standalone mode tags, and a service worker.
- **Offline app shell**: The shell assets are cached for repeat launches, while translation API responses are deliberately not cached.

## Tech stack

This is a static, dependency-free web app:

- HTML
- CSS
- Vanilla JavaScript
- Web App Manifest
- Service Worker
- MyMemory Translation API

There is no build system, backend server, database, or package manager required.

## How translation works

Translation is handled in `app.js` through the free MyMemory Translation API:

```text
GET https://api.mymemory.translated.net/get?q=<message>&langpair=<source>|<target>
```

The app detects language with a lightweight heuristic:

1. Spanish-specific punctuation or accented characters strongly indicate Spanish.
2. Common Spanish and English word dictionaries are scored.
3. If the text is too short or ambiguous, the app defaults to English → Mexican Spanish.

The selected translation pair is:

- English input: `en-US|es-MX`
- Spanish input: `es-MX|en-US`

The detected direction is displayed under the input before translation.

## Privacy model

The app itself does not store user text. User-entered messages live only in the page’s current memory and are cleared when the page is reopened or when the user taps **Clear**.

Important note: MyMemory’s free API accepts text through a URL query parameter. That means translated message text is sent to MyMemory and may appear in that provider’s server logs or browser network history. The service worker explicitly bypasses the MyMemory host so translation requests and responses are not cached by this app.

## File structure

```text
crystyl-translator/
├── index.html              # App markup, iOS/PWA meta tags, manifest link, SW registration
├── styles.css              # Chinese Blue + gold theme, quote card styling, sparkles, responsive layout
├── app.js                  # Language detection, translation, copy, clear, status handling
├── quotes.js               # Rotating Crystyl affirmation quote bank
├── manifest.webmanifest    # PWA install metadata
├── sw.js                   # App-shell cache; skips external translation API requests
├── icons/
│   ├── icon-source.svg
│   ├── icon-maskable-source.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
└── README.md
```

## Running locally

From the project directory:

```bash
python3 -m http.server 5000
```

Then open:

```text
http://localhost:5000/
```

Because this is a static app, no install or build step is required.

## Installing on iPhone

1. Open https://crystyl-translator.pplx.app in Safari.
2. Tap the iOS **Share** button.
3. Tap **Add to Home Screen**.
4. Confirm the name and icon.
5. Launch **Crystyl** from the Home Screen.

## Deployment

The app is published at:

```text
https://crystyl-translator.pplx.app
```

For a static preview deployment in Perplexity Computer:

```json
{
  "project_path": "/home/user/workspace/crystyl-translator",
  "site_name": "Crystyl Translator",
  "entry_point": "index.html"
}
```

For publishing to a permanent `pplx.app` subdomain, use the same folder as both the project path and static dist path because there is no build output directory.

## Testing checklist

- Input is blank on fresh page load.
- Quote card renders a quote and citation.
- English input translates to Spanish.
- Spanish input translates to English.
- Copy button is disabled until output exists.
- Copy button copies the translated text.
- Clear button clears input, output, status, and detected-language text.
- Service worker registers successfully.
- MyMemory translation requests are not cached.
- No browser storage APIs are used.

## Known limitations

- **Translation quality**: MyMemory is good for short casual messages, but slang, idioms, and long messages may need manual review.
- **Rate limits**: Anonymous MyMemory use can be rate-limited. Adding a `de=<email>` query parameter can increase the free quota if needed.
- **Internet required for translation**: The app shell can load offline, but translation requires an active network connection.
- **Heuristic detection**: Very short or mixed-language messages may be misclassified. Ambiguous messages default to English.
- **NLT licensing**: Bible excerpts are kept short and cited. Do not expand the Bible quote set with long NLT passages without checking licensing requirements.
- **Copyright safety**: Movie, country, and pop entries are original “inspired by” affirmations, not verbatim lyrics or dialogue.

## Portfolio summary

Crystyl Translator is a compact example of a personal-use PWA built around a real communication need. It combines browser-native APIs, a third-party translation service, privacy-conscious caching, mobile installability, and a deliberately personalized visual design. The project shows how a simple web app can feel thoughtful and useful without requiring authentication, a backend, or a complex deployment pipeline.

