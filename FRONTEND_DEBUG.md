# Frontend Debugging Guide

## Quick Steps to Find Your Saved Words

### 1. Click Extension Icon
- Look for the puzzle piece 🧩 in the top right of your browser
- If you don't see it, right-click any page and look for "Vocab Helper"

### 2. Click "📋 View Flashcards"
- A new tab opens with your saved words
- Click cards to flip and reveal definitions
- Click "Delete" to remove a card

---

## If the Button Doesn't Work

### Step 1: Check Console for Errors
1. Press `F12` (or right-click → Inspect)
2. Go to **Console** tab
3. Look for red error messages
4. Share the error text

### Step 2: Reload Extension
1. Go to `chrome://extensions`
2. Find "Vocab Helper"
3. Click the **reload icon** (circular arrow)
4. Wait 3 seconds

### Step 3: Try Again
- Click extension icon
- Click "View Flashcards" button

---

## If Tooltip Doesn't Work

### Check Service Worker Console
1. Go to `chrome://extensions`
2. Find "Vocab Helper"
3. Click **"Inspect views: service worker"**
4. Look for messages like:
   ```
   ✓ Vocab loaded: 17000+ entries
   ✓ Lemmatizer server is running
   ```

### If you see errors:
- Make sure Python server is running:
  ```bash
  source venv/bin/activate
  python3 lemmatizer_server.py
  ```

---

## Testing Checklist

- [ ] Extension icon visible in toolbar
- [ ] Clicking extension icon shows popup
- [ ] "View Flashcards" button is clickable
- [ ] New tab opens with dashboard
- [ ] Dashboard shows "No flashcards yet" or list of cards
- [ ] Double-clicking a word shows tooltip
- [ ] Tooltip has "Save to Flashcard" button
- [ ] Clicking save button saves the word
- [ ] Saved word appears in dashboard

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Popup won't open | Reload extension (chrome://extensions) |
| Dashboard blank | Check console (F12), look for errors |
| No tooltip | Double-click more deliberately, check console |
| Server error | Make sure Python server is running |
| "Not found" error | Try a different, more common word |

---

## Manual Testing (Advanced)

### Test Opening Dashboard
Open browser console and run:
```javascript
chrome.tabs.create({
  url: chrome.runtime.getURL('dashboard.html')
});
```

### Test Storage
Check if flashcards are saved:
```javascript
chrome.storage.local.get(['flashcards'], (result) => {
  console.log('Saved flashcards:', result.flashcards || []);
});
```

### Test Lookup
Test if extension talks to Python server:
```javascript
chrome.runtime.sendMessage({
  type: 'lookup',
  word: 'running'
}, (response) => {
  console.log('Response:', response);
});
```

---

## Still Stuck?

1. **Share console errors** - Press F12, look for red text
2. **Check server logs** - Look at terminal where Python server runs
3. **Reload everything** - Reload extension AND page
4. **Check service worker** - Go to chrome://extensions, click "Inspect views"

Screenshot the error if possible!
