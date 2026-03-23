# Quick Start - Vocab Helper

## 30-Second Setup

1. **Load the extension:**
   - Chrome: `chrome://extensions` → Developer mode ON → Load unpacked → Select this folder

2. **Test it immediately:**
   - Go to any webpage
   - Select (drag) or right-click the word **"hello"**
   - Right-click it to see definition!

3. **Save a word:**
   - Click "Save to Flashcard" in the tooltip
   - Word is saved ✓

4. **Review flashcards:**
   - Click extension icon (🧩)
   - Click "View Flashcards"
   - Click cards to flip, see definitions

## What's Inside

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration |
| `background.js` | Word lookup + lemmatization engine |
| `content-script.js` | Hover detection, tooltip display |
| `popup.html/js` | Extension menu |
| `dashboard.html/js` | Flashcard review interface |
| `styles.css` | Tooltip styling |
| `full_vocabs.json` | 17,000+ English words database |

## Features at a Glance

✅ **Lookup definitions** - Right-click any word or phrase
✅ **Smart lemmatization** - "running" → "run" automatically
✅ **Audio pronunciation** - Click 🔊 to hear it
✅ **Save to flashcards** - Build your personal word bank
✅ **YouTube captions** - Learn from videos with captions
✅ **Flip-card review** - Study at your own pace

## Usage Tips

**For optimal results:**
- Drag to select text, then right-click
- Works with single words AND phrases (e.g., "as long as")
- Use common English words (database is from Cambridge Dictionary)
- Make sure YouTube captions are visible before right-clicking

## Common Issues

| Problem | Solution |
|---------|----------|
| Tooltip doesn't appear | Make sure text is selected before right-clicking |
| Word not found | Try the base form (remove -ing, -ed, -s endings) |
| YouTube not working | Make sure captions are enabled with CC button |
| Flashcards not saving | Check browser console (F12) for errors |

For detailed testing guide, see `TESTING_GUIDE.md`

---

Enjoy learning! 📚
