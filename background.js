// Lemmatizer server URL (local Python Flask server)
const LEMMATIZER_URL = 'http://localhost:5555/lemmatize';
const LEMMATIZER_HEALTH = 'http://localhost:5555/health';

// Load vocabulary data
let vocabData = [];
let vocabIndex = {}; // Map word -> entry for faster lookup
let serverReady = false;
let vocabReady = false;

async function checkLemmatizerServer() {
  try {
    const response = await fetch(LEMMATIZER_HEALTH);
    if (response.ok) {
      serverReady = true;
      console.log('✓ Lemmatizer server is running');
      return true;
    }
  } catch (err) {
    console.warn('⚠ Lemmatizer server not available (make sure to run: python3 lemmatizer_server.py)');
  }
  return false;
}

async function loadVocab() {
  try {
    const url = chrome.runtime.getURL('full_vocabs.json');
    const response = await fetch(url);
    vocabData = await response.json();

    console.log('📥 Vocab data fetched:', vocabData.length, 'entries');

    // Build index for faster lookup
    vocabData.forEach(entry => {
      const word = entry.vocab.toLowerCase();
      if (!vocabIndex[word]) {
        vocabIndex[word] = entry;
      }
    });

    console.log('✓ Vocab index built:', Object.keys(vocabIndex).length, 'unique words');

    // Mark as ready
    vocabReady = true;

    // Check if lemmatizer server is available
    await checkLemmatizerServer();

    console.log('✓ All systems ready!');
  } catch (error) {
    console.error('Failed to load vocab:', error);
  }
}

// Load vocab immediately
loadVocab();

// Wait for vocab to be ready
function waitForVocab() {
  return new Promise((resolve) => {
    if (vocabReady) {
      resolve();
      return;
    }
    // Check every 100ms, max 5 seconds
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (vocabReady || attempts > 50) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
}

// Lemmatization via Python backend
async function lemmatize(word) {
  const lower = word.toLowerCase().trim();

  // Try exact match first (handles both words and phrases)
  if (vocabIndex[lower]) {
    console.log(`✓ Found exact match: "${lower}"`);
    return lower;
  }

  // If it's a phrase, try to find it even with variations
  if (lower.includes(' ')) {
    console.log(`🔍 Phrase detected, searching in vocab index...`);
    // Check if phrase exists (case-insensitive exact match)
    const foundEntry = Object.keys(vocabIndex).find(key =>
      key.toLowerCase() === lower
    );
    if (foundEntry) {
      console.log(`✓ Found phrase: "${foundEntry}"`);
      return foundEntry;
    }
  }

  // Try to use Python lemmatizer server
  if (serverReady) {
    try {
      const response = await fetch(LEMMATIZER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: lower })
      });

      if (response.ok) {
        const data = await response.json();
        const lemma = data.lemma.toLowerCase();

        if (lemma !== lower && vocabIndex[lemma]) {
          console.log(`lemma: "${lower}" → "${lemma}"`);
          return lemma;
        }
      }
    } catch (err) {
      console.warn('Lemmatizer server error:', err.message);
      // Fall through to local fallback
    }
  }

  // Fallback: Local suffix stripping (if server unavailable)
  const rules = [
    { suffix: 'ied', replacement: 'y', minLen: 4 },
    { suffix: 'ing', minLen: 4 },
    { suffix: 'ed', minLen: 3 },
    { suffix: 'ies', replacement: 'y', minLen: 4 },
    { suffix: 'es', minLen: 3 },
    { suffix: 's', minLen: 2 }
  ];

  for (const rule of rules) {
    if (lower.endsWith(rule.suffix)) {
      const base = rule.replacement
        ? lower.slice(0, -rule.suffix.length) + rule.replacement
        : lower.slice(0, -rule.suffix.length);

      if (base.length >= (rule.minLen || 2) && vocabIndex[base]) {
        console.log(`fallback suffix: "${lower}" → "${base}"`);
        return base;
      }
    }
  }

  console.log(`⚠ Not found: "${lower}"`);
  return lower;
}

// Fallback: fetch definition from Free Dictionary API
async function fetchFromFreeDict(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || !data[0]) return null;

    const result = data[0];
    const meanings = [];
    for (const meaning of (result.meanings || [])) {
      for (const def of (meaning.definitions || []).slice(0, 2)) {
        meanings.push({
          en: def.definition || '',
          vi: '',
          example: def.example || ''
        });
      }
      if (meanings.length >= 3) break;
    }

    return {
      vocab: result.word,
      vocabType: result.meanings?.[0]?.partOfSpeech || 'unknown',
      pronounce: {
        uk: result.phonetic || '',
        us: result.phonetic || '',
        ukmp3: result.phonetics?.find(p => p.audio)?.audio || '',
        usmp3: result.phonetics?.find(p => p.audio)?.audio || ''
      },
      translate: meanings,
      source: 'freedict'
    };
  } catch (err) {
    console.warn('Free Dictionary API error:', err.message);
    return null;
  }
}

// Message handler for lookups and flashcard saves
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'lookup') {
    const word = request.word;

    // Wait for vocab to be ready, then process
    waitForVocab().then(async () => {
      const lemmatized = await lemmatize(word);
      let entry = vocabIndex[lemmatized] || null;

      if (!entry) {
        console.log(`🌐 Not in local vocab, trying Free Dictionary API for "${lemmatized}"...`);
        entry = await fetchFromFreeDict(lemmatized);
        if (!entry && lemmatized !== word.toLowerCase()) {
          entry = await fetchFromFreeDict(word.toLowerCase());
        }
      }

      console.log(`📝 Lookup: "${word}" → "${lemmatized}" [${entry ? (entry.source === 'freedict' ? 'FOUND (web)' : 'FOUND') : 'NOT FOUND'}]`);

      sendResponse({
        original: word,
        lemmatized: lemmatized,
        entry: entry
      });
    }).catch(err => {
      console.error('Lookup error:', err);
      sendResponse({
        original: word,
        lemmatized: word,
        entry: null,
        error: true
      });
    });

    return true; // Keep channel open for async response
  } else if (request.type === 'saveFlashcard') {
    try {
      chrome.storage.local.get(['flashcards'], (result) => {
        const flashcards = result.flashcards || [];
        const newCard = {
          word: request.word || '',
          pos: request.pos || 'unknown',
          context: request.context || '',
          definition: request.definition || '',
          timestamp: new Date().toISOString()
        };

        flashcards.push(newCard);
        console.log(`💾 Saving flashcard:`, newCard);

        chrome.storage.local.set({ flashcards }, () => {
          console.log(`✓ Saved: "${request.word}" (total: ${flashcards.length})`);
          sendResponse({ success: true, totalCards: flashcards.length });
        });
      });
    } catch (err) {
      console.error('Save error:', err);
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }
});
