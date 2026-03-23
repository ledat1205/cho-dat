const MOCHI_API = 'https://app.mochi.cards/api';

function mochiHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(apiKey + ':')
  };
}

// Parse our markdown card format back into fields
// Format: "# word *(pos)*\n\n**Definition:** ...\n\n**Context:** "..."
function parseCardContent(content) {
  const word = (content.match(/^# (.+?) \*\((.+?)\)\*/m) || [])[1] || '';
  const pos  = (content.match(/^# .+? \*\((.+?)\)\*/m) || [])[1] || '';
  const definition = (content.match(/\*\*Definition:\*\* (.+)/) || [])[1] || '';
  const context    = (content.match(/\*\*Context:\*\* "(.+)"/) || [])[1] || '';
  return { word, pos, definition, context };
}

function setStatus(msg) {
  document.getElementById('count').textContent = msg;
}

async function loadFlashcards() {
  const container = document.getElementById('cardsContainer');
  const emptyState = document.getElementById('emptyState');

  container.innerHTML = '';
  emptyState.style.display = 'none';
  setStatus('Loading…');

  chrome.storage.local.get(['mochiApiKey', 'mochiDeckId'], async (cfg) => {
    if (!cfg.mochiApiKey || !cfg.mochiDeckId) {
      setStatus('');
      emptyState.innerHTML = '⚙️ Mochi not configured. <a href="#" onclick="openSettings()">Open Settings</a> to connect your account.';
      emptyState.style.display = 'block';
      return;
    }

    try {
      const res = await fetch(`${MOCHI_API}/cards?deck-id=${encodeURIComponent(cfg.mochiDeckId)}`, {
        headers: mochiHeaders(cfg.mochiApiKey)
      });

      if (res.status === 401) {
        setStatus('');
        emptyState.textContent = '❌ Invalid Mochi API key. Check Settings.';
        emptyState.style.display = 'block';
        return;
      }
      if (!res.ok) {
        setStatus('');
        emptyState.textContent = `❌ Mochi error ${res.status}. Try refreshing.`;
        emptyState.style.display = 'block';
        return;
      }

      const data = await res.json();
      const cards = (data.docs || []).filter(c => !c['archived?']);

      setStatus(`📊 Total: ${cards.length}`);

      if (cards.length === 0) {
        emptyState.textContent = 'No flashcards yet. Double-click words to add them!';
        emptyState.style.display = 'block';
        return;
      }

      container.innerHTML = cards.map(card => {
        const { word, pos, definition, context } = parseCardContent(card.content || '');
        const safeId = card.id.replace(/'/g, "\\'");
        const displayWord = word || card.id;
        return `
          <div class="card" onclick="toggleFlip(this)">
            <div class="card-word">${displayWord}</div>
            <div class="card-content">
              <strong>POS:</strong> ${pos}<br>
              <strong>Context:</strong> "${context}"<br>
              <strong>Definition:</strong> ${definition}
            </div>
            <div class="card-hint">Click to flip</div>
            <div class="card-actions">
              <button onclick="deleteCard(event, '${safeId}')">Delete</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      setStatus('');
      emptyState.textContent = '❌ Network error: ' + err.message;
      emptyState.style.display = 'block';
    }
  });
}

function toggleFlip(element) {
  element.classList.toggle('flipped');
}

async function deleteCard(event, cardId) {
  event.stopPropagation();

  chrome.storage.local.get(['mochiApiKey'], async (cfg) => {
    if (!cfg.mochiApiKey) return;

    try {
      const res = await fetch(`${MOCHI_API}/cards/${cardId}`, {
        method: 'DELETE',
        headers: mochiHeaders(cfg.mochiApiKey)
      });

      if (res.ok) {
        loadFlashcards();
      } else {
        alert(`Failed to delete card (${res.status})`);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });
}

function openSettings() {
  chrome.runtime.sendMessage({ type: 'openSettings' });
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFlashcards);
} else {
  loadFlashcards();
}
