// Check if chrome extension API is available
if (typeof chrome === 'undefined' || !chrome.runtime) {
  console.error('Chrome extension API not available');
}

// Store tooltip element
let currentTooltip = null;

// Create tooltip element
function createTooltip(data, x, y) {
  const tooltip = document.createElement('div');
  tooltip.className = 'vocab-tooltip';

  // Ensure tooltip doesn't go off-screen
  let posX = x;
  let posY = y;

  // Adjust if too close to right edge
  if (posX + 320 > window.innerWidth) {
    posX = window.innerWidth - 340;
  }

  // Adjust if too close to bottom
  if (posY + 400 > window.innerHeight) {
    posY = window.innerHeight - 420;
  }

  // Minimum position
  if (posX < 10) posX = 10;
  if (posY < 10) posY = 10;

  tooltip.style.left = posX + 'px';
  tooltip.style.top = posY + 'px';

  console.log('Creating tooltip at:', { x: posX, y: posY, dataEntry: !!data.entry });

  if (!data.entry) {
    tooltip.innerHTML = `<div class="vocab-notfound">❌ Word not found: <strong>${data.original}</strong><br><small>Try the base form (without -ing, -ed, -s)</small></div>`;
    return tooltip;
  }

  const entry = data.entry;
  let translationsHtml = (entry.translate || [])
    .slice(0, 3)  // Show first 3 meanings
    .map(t => `<div class="vocab-meaning">
      <strong>${t.en}</strong> - ${t.vi}
      <div class="vocab-example">"${t.example}"</div>
    </div>`)
    .join('');

  const definition = entry.translate && entry.translate[0] ? entry.translate[0].en : 'No definition';

  tooltip.innerHTML = `
    <div class="vocab-header">
      <div class="vocab-word">${entry.vocab}</div>
      <div class="vocab-type">${entry.vocabType}</div>
      ${entry.pronounce && entry.pronounce.usmp3 ? `<button class="vocab-audio" data-audio="${entry.pronounce.usmp3}">🔊</button>` : ''}
    </div>
    <div class="vocab-translations">${translationsHtml}</div>
    <button class="vocab-save" data-word="${entry.vocab}" data-type="${entry.vocabType}" data-definition="${definition}">Save to Flashcard</button>
  `;

  // Audio button listener
  const audioBtn = tooltip.querySelector('.vocab-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      new Audio(audioBtn.dataset.audio).play();
    });
  }

  // Save button listener
  const saveBtn = tooltip.querySelector('.vocab-save');
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    // Get surrounding text as context
    const selection = window.getSelection();
    let context = selection.toString() || data.original;

    console.log('Saving flashcard:', {
      word: saveBtn.dataset.word,
      type: saveBtn.dataset.type,
      context: context
    });

    chrome.runtime.sendMessage({
      type: 'saveFlashcard',
      word: saveBtn.dataset.word,
      type: saveBtn.dataset.type,
      definition: saveBtn.dataset.definition,
      context: context
    }, (response) => {
      console.log('Save response:', response);
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.background = '#4CAF50';
      saveBtn.disabled = true;
      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.remove();
        }
      }, 1200);
    });
  });

  return tooltip;
}

// Remove current tooltip
function removeTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

// Handle double-click on words
document.addEventListener('dblclick', (e) => {
  const word = window.getSelection().toString().trim();
  if (word.length === 0) return;

  if (!chrome || !chrome.runtime) {
    console.error('Extension API not available');
    return;
  }

  removeTooltip();

  // Position near the selection
  let x = e.pageX;
  let y = e.pageY + 20; // Position below the word

  // Send to background for lookup
  try {
    chrome.runtime.sendMessage({ type: 'lookup', word: word }, (response) => {
      console.log('Lookup response:', response);
      const tooltip = createTooltip(response, x, y);
      document.body.appendChild(tooltip);
      currentTooltip = tooltip;

      // Remove tooltip on click outside
      setTimeout(() => {
        document.addEventListener('click', removeTooltip, { once: true });
      }, 0);
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

// YouTube subtitle support
let youtubeListenerAdded = false;
function watchYouTubeSubtitles() {
  if (youtubeListenerAdded) return;

  const subtitleContainer = document.querySelector('.captions-window');
  if (!subtitleContainer) return;

  youtubeListenerAdded = true;
  console.log('YouTube subtitle listener added');

  subtitleContainer.addEventListener('dblclick', (e) => {
    const word = window.getSelection().toString().trim();
    if (word.length === 0) return;

    removeTooltip();
    chrome.runtime.sendMessage({ type: 'lookup', word: word }, (response) => {
      console.log('YouTube lookup response:', response);
      const tooltip = createTooltip(response, e.pageX, e.pageY + 20);
      document.body.appendChild(tooltip);
      currentTooltip = tooltip;

      setTimeout(() => {
        document.addEventListener('click', removeTooltip, { once: true });
      }, 0);
    });
  });
}

// Check for YouTube periodically
if (window.location.hostname.includes('youtube.com')) {
  console.log('YouTube detected');
  setInterval(watchYouTubeSubtitles, 1500);
}

console.log('Vocab Helper loaded');
