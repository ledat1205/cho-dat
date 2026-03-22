# Lemmatizer Server Setup

This guide explains how to set up the Python lemmatization server for the Vocab Helper extension.

## Why a Backend Server?

The extension now uses a **Python Flask server** with NLTK for professional-grade lemmatization. This gives you:

✅ **Irregular verb handling**: went → go, ate → eat
✅ **Accurate POS tagging**: Knows if it's a verb, noun, etc.
✅ **Better lemmas**: More accurate than simple suffix stripping
✅ **Fallback support**: Works offline with basic lemmatization

## Quick Setup (2 minutes)

### 1. Install Python Dependencies

```bash
cd ~/vocab-ext
bash setup_lemmatizer.sh
```

Or manually:
```bash
pip3 install flask flask-cors nltk
```

### 2. Start the Server

```bash
python3 lemmatizer_server.py
```

You should see:
```
==================================================
Lemmatizer Server Running
==================================================
API Endpoints:
  GET  http://localhost:5555/health
  POST http://localhost:5555/lemmatize
  POST http://localhost:5555/lemmatize_batch

Example usage:
  curl -X POST http://localhost:5555/lemmatize \
    -H "Content-Type: application/json" \
    -d '{"word": "running"}'
==================================================
```

### 3. Test the Server

In another terminal:
```bash
curl -X POST http://localhost:5555/lemmatize \
  -H "Content-Type: application/json" \
  -d '{"word": "running"}'
```

Expected response:
```json
{
  "original": "running",
  "lemma": "run",
  "success": true
}
```

### 4. Reload Extension

Go to `chrome://extensions` → Vocab Helper → reload

The extension will now use the Python server for lemmatization!

## Testing

### Test words (open browser DevTools - F12)

Double-click these words and check console:

**Irregular verbs:**
- "went" → should find "go"
- "ate" → should find "eat"
- "ran" → should find "run"

**Regular verbs:**
- "running" → should find "run"
- "played" → should find "play"

**Nouns:**
- "cities" → should find "city"
- "boxes" → should find "box"

### Check server is working

In the service worker console (`chrome://extensions` → Vocab Helper → "Inspect views: service worker"):

You should see:
```
✓ Lemmatizer server is running
```

If you see:
```
⚠ Lemmatizer server not available
```

Make sure the Python server is running on port 5555.

## Troubleshooting

### Server won't start

**Problem:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
pip3 install flask flask-cors nltk
```

### "Lemmatizer server not available"

**Problem:** The server is not running

**Solution:**
1. Make sure you ran `python3 lemmatizer_server.py`
2. Check that port 5555 is not blocked
3. Try: `curl http://localhost:5555/health`

### Words still not working

**Problem:** Server is running but lemmatization still failing

**Solution:**
1. Check browser console (F12) for errors
2. Check server logs (terminal where you ran the server)
3. Try a simple word: "running"

### "CORS error" in console

**Problem:** Browser blocking request to localhost

**Solution:**
- This shouldn't happen, flask-cors is enabled
- Try reloading the extension

## How It Works

```
User double-clicks "running"
    ↓
Content script sends to background.js
    ↓
background.js checks if server is ready
    ↓
Sends POST to http://localhost:5555/lemmatize
    ↓
Python server runs NLTK lemmatization
    ↓
Returns: {"lemma": "run"}
    ↓
Looks up "run" in vocabulary
    ↓
Shows definition in tooltip
```

## API Reference

### POST /lemmatize

Lemmatize a single word.

**Request:**
```json
{
  "word": "running"
}
```

**Response:**
```json
{
  "original": "running",
  "lemma": "run",
  "success": true
}
```

### POST /lemmatize_batch

Lemmatize multiple words at once.

**Request:**
```json
{
  "words": ["running", "played", "cities"]
}
```

**Response:**
```json
{
  "results": [
    {"original": "running", "lemma": "run"},
    {"original": "played", "lemma": "play"},
    {"original": "cities", "lemma": "city"}
  ],
  "success": true
}
```

### GET /health

Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "service": "lemmatizer"
}
```

## Keeping the Server Running

### Option 1: Manual Terminal (for development)
```bash
python3 lemmatizer_server.py
```

### Option 2: Background Process (macOS/Linux)
```bash
nohup python3 lemmatizer_server.py > lemmatizer.log 2>&1 &
```

### Option 3: Use a process manager
```bash
# Install pm2
npm install -g pm2

# Start server
pm2 start lemmatizer_server.py --name "lemmatizer"

# View logs
pm2 logs lemmatizer
```

## Performance

- **Cold start:** ~1-2 seconds (NLTK initializing)
- **Lookup time:** ~50-100ms per word
- **Batch processing:** ~200ms for 5 words

## Offline Fallback

If the server is not running, the extension automatically falls back to:
- Simple suffix stripping
- Regular expression rules

You can still use the extension, but with less accurate lemmatization.

---

**That's it!** Your lemmatization server is ready. 🚀
