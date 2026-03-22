# Debugging Guide

## Check If Extension is Working

1. **Open Chrome DevTools**
   - Press `F12` on your browser
   - Go to "Console" tab

2. **Reload the extension**
   - Go to `chrome://extensions`
   - Find "Vocab Helper"
   - Click the reload icon

3. **Check the service worker logs**
   - In `chrome://extensions`, find Vocab Helper
   - Click "Inspect views: service worker"
   - Check console for:
     - "✓ Vocab loaded: XXXX entries"
     - "✓ Compromise loaded: true"

## Testing the Lookup

1. **In your browser, open any webpage**
2. **Open DevTools (F12)**
3. **Go to Console tab**
4. **Double-click a word like "hello"**

You should see in console:
```
Lookup request for: hello
Response: {original: 'hello', lemmatized: 'hello', hasEntry: true}
```

## Check if Compromise Loaded

Go to `chrome://extensions` → Vocab Helper → "Inspect views: service worker"

Look for:
```
✓ Vocab loaded: 17000+ entries
✓ Compromise NLP loaded from CDN
```

Or if CDN fails (offline):
```
⚠ Compromise loading failed, using fallback lemmatization
```

Both modes work fine - compromise gives better results for irregular verbs like "went" → "go".

## If Lemmatization Not Working

The extension uses **Compromise NLP** for smart lemmatization.

Try these words (Compromise handles these better):
- "running" → finds "run"
- "played" → finds "play"
- "cats" → finds "cat"
- "cried" → finds "cry"
- "cities" → finds "city"
- "went" → finds "go" (irregular verbs!)
- "ate" → finds "eat"

Example console output for "running":
```
Response: {original: 'running', lemmatized: 'run', hasEntry: true}
lemma: "running" → "run"
```

If you see `lemma:` message, Compromise is working!
If not, it falls back to simple suffix stripping.

## If Save Not Working

1. **Double-click a word**
2. **Open DevTools (F12)**
3. **Go to Application tab → Local Storage**
4. **Find entry starting with "chrome-extension://"`
5. **Click on it to see saved data**

Or in Console, run:
```javascript
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('Saved flashcards:', result.flashcards || []);
});
```

You should see your saved words listed.

## Common Issues & Solutions

### "Vocab data loaded: 0 entries"
- **Problem**: Vocabulary file didn't load
- **Solution**:
  - Check that `full_vocabs.json` exists in the folder
  - Reload extension (click reload icon)
  - Check file size: should be ~17MB

### "Word not found" for common words
- **Problem**: Vocabulary doesn't have that word
- **Solution**:
  - Database is from Cambridge Dictionary (might not have all words)
  - Try simpler/more common words
  - Try base form without suffixes

### Save button doesn't work
- **Problem**: chrome.storage API not responding
- **Solution**:
  - Check console for errors (F12)
  - Make sure extension is loaded properly
  - Try saving again (sometimes needs 2-3 tries first time)

### Tooltip doesn't appear
- **Problem**: Double-click not detected or script not injected
- **Solution**:
  - Try double-clicking more deliberately
  - Check console for "Vocab Helper loaded" message
  - Reload extension and try again

### Tooltip in wrong position
- **Problem**: Positioning calculation off
- **Solution**:
  - Should appear ~20px below your double-click
  - If it's off-screen, try double-clicking closer to top

## Quick Console Tests

Run these in the Console tab to test specific functionality:

```javascript
// Test 1: Check if vocab is loaded
chrome.runtime.getBackgroundPage((bg) => {
  console.log('Vocab data size:', bg.vocabData.length);
});

// Test 2: Manually test lookup
chrome.runtime.sendMessage({type: 'lookup', word: 'hello'}, (response) => {
  console.log('Lookup result:', response);
});

// Test 3: Check saved flashcards
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('Total flashcards:', (result.flashcards || []).length);
});

// Test 4: Save a test flashcard
chrome.runtime.sendMessage({
  type: 'saveFlashcard',
  word: 'test',
  type: 'noun',
  definition: 'a procedure',
  context: 'This is a test'
}, (response) => {
  console.log('Save result:', response);
});
```

## Expected Console Output

After double-clicking "hello":

```
Vocab Helper loaded
Lookup request for: hello
Lemmatizing: hello
Found original word: hello
Sending response: {original: 'hello', lemmatized: 'hello', hasEntry: true}
```

After clicking save:
```
Saving flashcard: {word: 'hello', type: 'exclamation', context: 'hello'}
Save response: {success: true, totalCards: 1}
```

## Get More Details

To enable full debugging:
1. Open `background.js`
2. All console.log() statements will show in service worker console
3. Open `content-script.js`
4. All console.log() statements will show in page console

---

If still stuck, check all console output and share what error messages you see!
