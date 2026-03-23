// Load and display flashcards
function loadFlashcards() {
  console.log('=== loadFlashcards called ===');

  if (!chrome || !chrome.storage) {
    console.error('❌ Chrome storage API not available');
    document.body.innerHTML = '<h1>❌ Extension API not available</h1>';
    return;
  }

  console.log('Fetching flashcards from storage...');

  chrome.storage.local.get(['flashcards'], (result) => {
    console.log('✓ Storage callback received');
    console.log('Result:', result);

    const flashcards = result.flashcards || [];
    const container = document.getElementById('cardsContainer');
    const emptyState = document.getElementById('emptyState');
    const count = document.getElementById('count');

    console.log('Loaded', flashcards.length, 'flashcards');

    if (!container) {
      console.error('❌ cardsContainer element not found!');
      return;
    }

    if (!count) {
      console.error('❌ count element not found!');
      return;
    }

    // Update count
    count.textContent = `📊 Total: ${flashcards.length}`;

    if (flashcards.length === 0) {
      console.log('No flashcards - showing empty state');
      emptyState.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    console.log('Rendering', flashcards.length, 'cards...');
    emptyState.style.display = 'none';

    try {
      container.innerHTML = flashcards.map((card, idx) => {
        console.log(`Card ${idx}:`, card);

        const safeWord = (card.word || '').replace(/'/g, "\\'").substring(0, 100);
        const safePos = (card.pos || card.type || 'unknown').substring(0, 50);
        const safeContext = (card.context || '').replace(/'/g, "\\'").substring(0, 200);
        const safeDefinition = (card.definition || '').replace(/'/g, "\\'").substring(0, 200);

        return `
          <div class="card" onclick="toggleFlip(this)">
            <div class="card-word">${safeWord}</div>
            <div class="card-content">
              <strong>POS:</strong> ${safePos}<br>
              <strong>Context:</strong> "${safeContext}"<br>
              <strong>Definition:</strong> ${safeDefinition}
            </div>
            <div class="card-hint">Click to flip</div>
            <div class="card-actions">
              <button onclick="deleteCard(event, ${idx})">Delete</button>
            </div>
          </div>
        `;
      }).join('');

      console.log('✓ Cards rendered successfully');
    } catch (err) {
      console.error('Error rendering cards:', err);
      container.innerHTML = '<p style="color:red;">Error rendering cards: ' + err.message + '</p>';
    }
  });
}

function toggleFlip(element) {
  console.log('Toggling flip on card');
  element.classList.toggle('flipped');
}

function deleteCard(event, idx) {
  console.log('Deleting card at index:', idx);
  event.stopPropagation();

  chrome.storage.local.get(['flashcards'], (result) => {
    const flashcards = result.flashcards || [];
    console.log('Before delete:', flashcards.length);

    flashcards.splice(idx, 1);
    console.log('After delete:', flashcards.length);

    chrome.storage.local.set({ flashcards }, () => {
      console.log('Delete complete, reloading...');
      loadFlashcards();
    });
  });
}

function clearAllCards() {
  if (confirm('Delete all flashcards? This cannot be undone.')) {
    console.log('Clearing all cards');
    chrome.storage.local.set({ flashcards: [] }, () => {
      console.log('All cards cleared');
      loadFlashcards();
    });
  }
}

function exportFlashcards() {
  console.log('Exporting flashcards');

  chrome.storage.local.get(['flashcards'], (result) => {
    const flashcards = result.flashcards || [];

    if (flashcards.length === 0) {
      alert('No flashcards to export');
      return;
    }

    // Create JSON data
    const data = {
      exportDate: new Date().toISOString(),
      totalCards: flashcards.length,
      cards: flashcards
    };

    // Create blob and download
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab-flashcards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Exported', flashcards.length, 'cards');
    alert('Exported ' + flashcards.length + ' flashcards!');
  });
}

// Log when script loads
console.log('=== Dashboard.js loaded ===');
console.log('Current time:', new Date().toISOString());
console.log('Chrome available:', typeof chrome !== 'undefined');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    loadFlashcards();
  });
} else {
  console.log('DOM already loaded, calling loadFlashcards immediately');
  loadFlashcards();
}

// Also try loading after a short delay to be safe
setTimeout(() => {
  console.log('Delayed load attempt...');
  if (!document.getElementById('cardsContainer').innerHTML) {
    loadFlashcards();
  }
}, 500);
