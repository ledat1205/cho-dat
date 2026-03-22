# Dashboard Debugging Guide

## Quick Fix - Try This First

1. **Reload everything:**
   - Close all Vocab Helper tabs
   - Go to `chrome://extensions`
   - Click reload on Vocab Helper
   - Wait 3 seconds

2. **Click extension icon again:**
   - Should see popup
   - Click "View Flashcards"
   - New tab should open

---

## If Dashboard Still Doesn't Show

### Step 1: Check if Tab Opened
- Did a new tab open? (even if blank)
- If **NO**: Extension button might not be loaded
  - Try: Reload extension again

- If **YES, but blank**: Continue to Step 2

### Step 2: Check Console for Errors
1. In the flashcard tab, press `F12` (DevTools)
2. Go to **Console** tab
3. Look for any red error messages
4. Copy the error and share it

### Step 3: Check What's Loaded
In the Console, paste this and press Enter:
```javascript
console.log('Dashboard page loaded');
console.log('document.body:', document.body ? 'found' : 'NOT FOUND');
console.log('container:', document.getElementById('cardsContainer') ? 'found' : 'NOT FOUND');
```

You should see:
```
Dashboard page loaded
document.body: found
container: found
```

If you see "NOT FOUND", the page didn't load correctly.

### Step 4: Check if Storage Works
In the Console, paste this:
```javascript
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('Flashcards in storage:', result.flashcards || []);
});
```

You'll see either:
- `[]` - No flashcards saved yet
- `[{word: 'hello', ...}, ...]` - Your saved words

---

## If You Have Saved Words But Dashboard is Empty

This means storage has data but it's not displaying. Try:

1. **Manually trigger load:**
   In Console:
   ```javascript
   loadFlashcards();
   ```

2. **Check for JavaScript errors:**
   - Look in Console for red messages
   - Share the error

---

## If You Don't Have Saved Words

This means you haven't saved any yet. Try:

1. **Go back to a webpage**
2. **Double-click a word** (like "hello")
3. **Click "Save to Flashcard"** button in tooltip
4. **Wait 1-2 seconds**
5. **Go back to dashboard**
6. **Reload dashboard tab** (F5 or Cmd+R)

---

## Complete Testing Checklist

- [ ] Extension icon shows in toolbar
- [ ] Click icon shows popup
- [ ] "View Flashcards" button is clickable
- [ ] Clicking button opens new tab
- [ ] New tab shows "📚 Flashcard Review" title
- [ ] If no words saved: shows "No flashcards yet"
- [ ] If words saved: shows cards with words
- [ ] Can click card to flip it
- [ ] Can click "Delete" to remove card
- [ ] Can click "Clear All" to delete all

---

## Console Test Commands

### Check if extension works
```javascript
console.log('Hello from dashboard');
```

### Check if storage works
```javascript
chrome.storage.local.get(['flashcards'], (r) => console.log(r));
```

### Check if DOM is ready
```javascript
console.log('Flashcard container:', document.getElementById('cardsContainer'));
```

### Manually load and show cards
```javascript
chrome.storage.local.get(['flashcards'], (r) => {
  console.log('Data:', r.flashcards);
  if (r.flashcards && r.flashcards.length > 0) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '<p>Has ' + r.flashcards.length + ' cards</p>';
  }
});
```

---

## What Should You See?

### If No Cards Saved:
```
📚 Flashcard Review
📊 Total: 0
[Clear All] button
No flashcards yet. Double-click words to add them!
```

### If Cards Are Saved:
```
📚 Flashcard Review
📊 Total: 3
[Clear All] button
[Card 1]  [Card 2]  [Card 3]
```

Each card shows the word. Click to reveal definition.

---

## Still Not Working?

When you share the issue, include:

1. **Console errors** (F12 → Console tab)
2. **What you see** (blank page? white page? error?)
3. **Did you save any words?**
4. **Steps to reproduce** (exactly what you clicked)

Open an issue with this info and we can debug further!
