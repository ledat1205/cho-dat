# Dashboard Troubleshooting Guide

## Step 1: Check if Dashboard Opens

1. Click extension icon 🧩
2. Click "📋 View Flashcards"
3. **Does a new tab open?**

- **YES** → Go to Step 2
- **NO** → Extension button not working, reload extension:
  ```
  chrome://extensions → Vocab Helper → reload icon
  ```

---

## Step 2: Check Console for Errors

1. In the **flashcard tab**, press `F12` (DevTools)
2. Go to **Console** tab
3. You should see messages like:
   ```
   === Dashboard.js loaded ===
   Current time: 2026-03-22T...
   Chrome available: true
   DOM already loaded, calling loadFlashcards immediately
   ✓ Storage callback received
   Loaded 3 flashcards
   ✓ Cards rendered successfully
   ```

4. **Look for RED error messages**

### Common Errors & Fixes:

**Error: "Chrome storage API not available"**
- Extension didn't load properly
- Solution: Reload extension

**Error: "cardsContainer element not found"**
- HTML file didn't load properly
- Solution: Close tab and reopen

**Error: "Error rendering cards: ..."**
- Data format issue
- Check Step 3 below

---

## Step 3: Check If Any Words Are Saved

In the **Console**, paste this:

```javascript
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('=== STORAGE DEBUG ===');
  console.log('Flashcards in storage:', result.flashcards || []);
  console.log('Total:', result.flashcards ? result.flashcards.length : 0);
  if (result.flashcards && result.flashcards[0]) {
    console.log('First card:', result.flashcards[0]);
  }
});
```

**You should see:**
- `[]` - No cards saved yet
- `[{word: 'hello', ...}]` - Your saved cards exist

---

## Step 4: Manually Test Saving a Word

1. Go to any webpage
2. Double-click a word (e.g., "hello")
3. Tooltip appears with "Save to Flashcard" button
4. Click the button
5. Button shows: ✓ Saved!

**If button shows ERROR instead:**
- Go to console (F12)
- Look for error messages
- Share the error

---

## Step 5: Force Dashboard to Load Data

In the **Console** on the dashboard tab, paste:

```javascript
console.log('Force reloading...');
loadFlashcards();
```

Press Enter. Cards should appear!

---

## Complete Debug Checklist

- [ ] Dashboard tab opens (new tab created)
- [ ] No red errors in console
- [ ] Console shows "✓ Cards rendered" or "No flashcards"
- [ ] Storage check shows cards OR empty array
- [ ] Saved at least one word
- [ ] Word appears in dashboard after reload

---

## Expected Outputs

### If NO words saved:
```
=== Dashboard.js loaded ===
Chrome available: true
DOMContentLoaded fired
✓ Storage callback received
Result: { flashcards: undefined }
Loaded 0 flashcards
No flashcards - showing empty state
```

**Page shows:** "No flashcards yet. Double-click words to add them!"

### If words ARE saved:
```
=== Dashboard.js loaded ===
Chrome available: true
✓ Storage callback received
Result: { flashcards: [{ word: 'hello', ... }] }
Loaded 1 flashcards
Card 0: { word: 'hello', pos: 'interjection', ... }
✓ Cards rendered successfully
```

**Page shows:** Card with "hello" on front

---

## Action Items

1. **First, save a word:**
   - Go to webpage
   - Double-click "hello"
   - Click "Save to Flashcard"
   - Wait for ✓ Saved message

2. **Then, open dashboard:**
   - Extension icon → View Flashcards
   - Open DevTools (F12)
   - Share what you see in console

3. **If still blank:**
   - Run the manual test in Step 5
   - Copy console output
   - Share the error

---

## Console Quick Commands

**Check if extension works:**
```javascript
console.log('Chrome available:', typeof chrome !== 'undefined');
console.log('Storage API:', typeof chrome.storage !== 'undefined');
```

**See all stored data:**
```javascript
chrome.storage.local.get(null, (items) => console.log('All storage:', items));
```

**Clear all data (WARNING!):**
```javascript
chrome.storage.local.clear(() => console.log('Storage cleared'));
```

---

Let me know what console messages you see!
