# Quick Start - Vocab Helper

## 30-Second Setup

1. **Load the extension:**
   - Chrome: `chrome://extensions` → Developer mode ON → Load unpacked → Select this folder

2. **Test it immediately:**
   - Go to any webpage
   - Double-click the word **"hello"**
   - A tooltip with definition should appear!

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

✅ **Hover for definitions** - Double-click any word
✅ **Smart lemmatization** - "running" → "run" automatically
✅ **Audio pronunciation** - Click 🔊 to hear it
✅ **Save to flashcards** - Build your personal word bank
✅ **YouTube captions** - Learn from videos with captions
✅ **Flip-card review** - Study at your own pace

## Usage Tips

**For optimal results:**
- Double-click the actual word (not a phrase)
- Use common English words (database is from Cambridge Dictionary)
- Try base form if a word isn't found (e.g., "run" instead of "running")
- Make sure YouTube captions are visible before double-clicking

## Common Issues

| Problem | Solution |
|---------|----------|
| Tooltip doesn't appear | Try a different word, double-click the word itself |
| Word not found | Try the base form (remove -ing, -ed, -s endings) |
| YouTube not working | Make sure captions are enabled with CC button |
| Flashcards not saving | Check browser console (F12) for errors |

For detailed testing guide, see `TESTING_GUIDE.md`

---

Enjoy learning! 📚
