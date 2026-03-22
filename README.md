# Vocab Helper - English Learning Browser Extension

A simple, personal-use browser extension for learning English vocabulary while browsing the web or watching YouTube videos.

## Features

✅ **Hover Definition Lookup**
- Double-click any word on a webpage to see its definition
- Shows: pronunciation, part of speech, translations (EN/VI), and example sentences

✅ **Lemmatization**
- Automatically converts inflected words to base form before lookup (e.g., "running" → "run")
- Handles common suffixes: -ing, -ed, -es, -s, -ies

✅ **YouTube Subtitle Support**
- Double-click words in YouTube captions to get definitions

✅ **Flashcard System**
- Save words with context sentences for later review
- Flip-card interface for studying
- Delete cards when learned

## Installation

1. Open Chrome/Edge and go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `vocab-ext` folder

## Usage

**Looking up words:**
- Double-click any word on a webpage
- Tooltip will appear with definition, pronunciation, and meaning

**Saving to flashcards:**
- Click "Save to Flashcard" in the tooltip
- Word + context sentence will be saved

**Reviewing flashcards:**
- Click the extension icon → "View Flashcards"
- Click cards to flip between word and definition
- Click "Delete" to remove a card

## File Structure

```
vocab-ext/
├── manifest.json          - Extension config
├── background.js          - Lemmatization & vocab lookup
├── content-script.js      - Hover detection & tooltips
├── popup.html/js          - Extension popup UI
├── dashboard.html/js      - Flashcard review interface
├── styles.css             - Tooltip styling
└── full_vocabs.json       - Vocabulary database (17k+ words)
```

## Technical Notes

- **Data**: Uses `full_vocabs.json` with 17k+ English words
- **Storage**: Flashcards saved in browser's IndexedDB (local storage)
- **Lemmatization**: Simple suffix-stripping rules (can be enhanced)
- **Performance**: Initial load may take 1-2 seconds for vocab data

## Troubleshooting

**Words not found:**
- Check if word exists in vocabulary (Cambridge dictionary sourced)
- Try the base form (e.g., "run" instead of "running")

**Tooltip not appearing:**
- Make sure you double-clicked the word
- Check browser console for errors (F12 → Console)

**YouTube captions not working:**
- Only works with English subtitles
- Make sure captions are enabled on the video

## Future Improvements

- Use NLP library for better lemmatization
- Add spaced repetition algorithm for flashcards
- Support for more languages
- Search history & statistics
