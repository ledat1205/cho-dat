// Load and display flashcards
function loadFlashcards() {
  console.log('loadFlashcards called');

  if (!chrome || !chrome.storage) {
    console.error('Chrome storage API not available');
    showError('Extension API not available');
    return;
  }

  chrome.storage.local.get(['flashcards'], (result) => {
    console.log('Storage result:', result);

    const flashcards = result.flashcards || [];
    const container = document.getElementById('cardsContainer');
    const emptyState = document.getElementById('emptyState');
    const count = document.getElementById('count');

    console.log('Loaded', flashcards.length, 'flashcards');

    if (!container || !count) {
      console.error('DOM elements not found');
      return;
    }

    count.textContent = `📊 Total: ${flashcards.length}`;

    if (flashcards.length === 0) {
      console.log('No flashcards, showing empty state');
      emptyState.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    console.log('Rendering', flashcards.length, 'cards');
    emptyState.style.display = 'none';

    container.innerHTML = flashcards.map((card, idx) => {
      const safeWord = (card.word || '').replace(/'/g, "\\'");
      const safeType = (card.type || 'unknown').replace(/'/g, "\\'");
      const safeContext = (card.context || '').replace(/'/g, "\\'");
      const safeDefinition = (card.definition || '').replace(/'/g, "\\'");

      return `
        <div class="card" onclick="toggleFlip(this)">
          <div class="card-word">${safeWord}</div>
          <div class="card-content">
            <strong>Type:</strong> ${safeType}<br>
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

    console.log('Cards rendered successfully');
  });
}

function toggleFlip(element) {
  console.log('Toggling flip');
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
      console.log('Deleted, reloading');
      loadFlashcards();
    });
  });
}

function clearAllCards() {
  if (confirm('Delete all flashcards? This cannot be undone.')) {
    console.log('Clearing all cards');
    chrome.storage.local.set({ flashcards: [] }, () => {
      console.log('All cards cleared, reloading');
      loadFlashcards();
    });
  }
}

function showError(message) {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.textContent = '❌ ' + message;
    emptyState.style.display = 'block';
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
    alert('Exported ' + flashcards.length + ' flashcards!\nFile: vocab-flashcards-' + new Date().toISOString().split('T')[0] + '.json');
  });
}

// Load flashcards when page loads
console.log('Dashboard.js loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, loading flashcards');
  loadFlashcards();
});

// Also try loading immediately
loadFlashcards();
