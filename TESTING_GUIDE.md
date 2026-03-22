# Testing Guide for Vocab Helper Extension

## Quick Setup

1. Open Chrome/Edge and go to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `vocab-ext` folder
5. You should see "Vocab Helper" appear in your extensions list

## Testing Checklist

### 1. Extension Loads ✓
- [ ] Extension appears in `chrome://extensions`
- [ ] No red error messages
- [ ] Icon appears in toolbar

### 2. Test Basic Word Lookup
- [ ] Go to any webpage (e.g., Google, news site, etc.)
- [ ] Double-click on a simple word (e.g., "the", "a", "and", "hello", "world")
- [ ] Tooltip should appear with:
  - Word name
  - Part of speech (noun, verb, etc.)
  - Speaker icon (🔊)
  - Definitions in English + Vietnamese
  - Example sentences

### 3. Test Lemmatization
- [ ] Double-click on a word with a suffix:
  - "running" → should find "run"
  - "played" → should find "play"
  - "cats" → should find "cat"
  - "cities" → should find "city"

### 4. Test Audio Pronunciation
- [ ] In tooltip, click the 🔊 button
- [ ] Should hear audio pronunciation (requires internet)

### 5. Test Flashcard Save
- [ ] Double-click a word to show tooltip
- [ ] Click "Save to Flashcard" button
- [ ] Button should show "Saved! ✓"
- [ ] Tooltip should close

### 6. Test Flashcard Dashboard
- [ ] Click extension icon (puzzle piece)
- [ ] Click "View Flashcards" button
- [ ] New tab should open with flashcard dashboard
- [ ] You should see cards you saved with:
  - Word displayed on front
  - "Click to reveal" hint

### 7. Test Flip Cards
- [ ] On dashboard, click a card
- [ ] Card should flip to show:
  - Type (noun, verb, etc.)
  - Context (sentence you double-clicked)
  - Definition

### 8. Test Delete Card
- [ ] On dashboard, click "Delete" button on a card
- [ ] Card should be removed
- [ ] Total count should decrease

### 9. Test YouTube Subtitles
- [ ] Go to YouTube and open a video with captions
- [ ] Enable captions (CC button)
- [ ] Double-click a word in the captions
- [ ] Tooltip should appear with definition

## Debugging Tips

**If tooltips don't appear:**
1. Check browser console (F12 → Console tab)
2. Look for red error messages
3. Reload the extension: Go to `chrome://extensions`, find Vocab Helper, click the reload icon

**If word not found:**
1. Try the base form of the word (without suffixes)
2. Check spelling
3. Open console and type: `console.log('testing')` to verify console works

**If flashcards don't save:**
1. Check browser console for errors
2. Open DevTools (F12) → Storage tab → Local Storage
3. Look for `chrome-extension://.../popup.html` entries

**If YouTube feature doesn't work:**
1. Make sure captions are enabled (CC button visible)
2. Captions must be showing in English
3. Reload the page

## Browser Console Testing

Open DevTools (F12) on any page and run:

```javascript
// Test vocab data is loaded
chrome.runtime.sendMessage({type: 'lookup', word: 'hello'}, (response) => {
  console.log('Lookup result:', response);
});

// Test storage
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('Saved flashcards:', result.flashcards || []);
});
```

## Expected Performance

- **Initial load**: 1-2 seconds for vocab data to load
- **Word lookup**: Should be instant (< 100ms)
- **Tooltip display**: Should appear within 100ms of double-click
- **Flashcard save**: Should complete within 1 second

## Known Limitations

1. Lemmatization only handles common suffixes
2. YouTube support only works with captions that are displayed
3. Audio playback requires internet connection
4. Context is limited to the selected text (doesn't grab full sentence)

## File Sizes Reference

- `full_vocabs.json`: ~17 MB (don't edit manually)
- Total extension size: ~17 MB
- Flashcards storage: Stored in browser, unlimited

---

If you encounter issues not listed here, check the browser console (F12) for error messages!
