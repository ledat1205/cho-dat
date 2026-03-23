// Store tooltip element
let currentTooltip = null;

// Extract the full sentence containing the selected word/phrase
function extractSentenceContext(word) {
  const selection = window.getSelection();

  if (selection.rangeCount === 0) {
    return word;
  }

  try {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Get the text node or parent text
    let textNode = startContainer.nodeType === 3 ? startContainer : startContainer.textContent ? startContainer : null;
    if (!textNode) return word;

    // Get full text from the paragraph or container
    let container = textNode.nodeType === 3 ? textNode.parentElement : textNode;

    // Try to find the closest paragraph, div, or sentence container
    while (container && !['P', 'DIV', 'SPAN', 'ARTICLE', 'SECTION'].includes(container.tagName)) {
      container = container.parentElement;
    }

    if (!container) {
      return word;
    }

    let fullText = container.textContent || '';
    fullText = fullText.trim();

    // Find sentence boundaries (period, question mark, exclamation mark, or newline)
    const selectedText = selection.toString();
    const selectedIndex = fullText.indexOf(selectedText);

    if (selectedIndex === -1) {
      return selectedText;
    }

    // Find the start of the sentence
    let sentenceStart = selectedIndex;
    for (let i = selectedIndex - 1; i >= 0; i--) {
      if (fullText[i] === '.' || fullText[i] === '?' || fullText[i] === '!' || fullText[i] === '\n') {
        sentenceStart = i + 1;
        break;
      }
    }
    if (sentenceStart === selectedIndex) {
      sentenceStart = 0;
    }

    // Find the end of the sentence
    let sentenceEnd = selectedIndex + selectedText.length;
    for (let i = selectedIndex + selectedText.length; i < fullText.length; i++) {
      if (fullText[i] === '.' || fullText[i] === '?' || fullText[i] === '!' || fullText[i] === '\n') {
        sentenceEnd = i + 1;
        break;
      }
    }

    // Extract and clean the sentence
    let sentence = fullText.substring(sentenceStart, sentenceEnd).trim();

    // Remove extra whitespace
    sentence = sentence.replace(/\s+/g, ' ');

    // If sentence is too long, try to keep it reasonable (max 200 chars)
    if (sentence.length > 200) {
      // Try to find a shorter sentence around the selected text
      const beforeText = fullText.substring(Math.max(0, selectedIndex - 100), selectedIndex);
      const afterText = fullText.substring(selectedIndex + selectedText.length, Math.min(fullText.length, selectedIndex + selectedText.length + 100));

      let shortSentence = beforeText + selectedText + afterText;
      shortSentence = shortSentence.trim().replace(/\s+/g, ' ');
      sentence = shortSentence;
    }

    console.log('Extracted sentence:', sentence);
    return sentence || selectedText;

  } catch (error) {
    console.error('Error extracting sentence:', error);
    return selection.toString() || word;
  }
}

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

    // Extract the full sentence containing the word/phrase
    const sentence = extractSentenceContext(data.original);

    console.log('Saving flashcard:', {
      word: saveBtn.dataset.word,
      type: saveBtn.dataset.type,
      sentence: sentence
    });

    chrome.runtime.sendMessage({
      type: 'saveFlashcard',
      word: saveBtn.dataset.word,
      pos: saveBtn.dataset.type,
      definition: saveBtn.dataset.definition,
      context: sentence
    }, (response) => {
      console.log('Save response:', response);
      if (response && response.success) {
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.background = '#4CAF50';
        saveBtn.disabled = true;
        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.remove();
          }
        }, 1200);
      } else {
        console.error('Save failed:', response);
        saveBtn.textContent = '❌ Error';
        saveBtn.style.background = '#f44336';
      }
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

// Handle right-click (context menu)
document.addEventListener('contextmenu', (e) => {
  const selection = window.getSelection().toString().trim();

  if (selection.length === 0) {
    // No text selected - allow normal context menu
    return;
  }

  // Prevent default context menu
  e.preventDefault();

  if (!chrome || !chrome.runtime) {
    console.error('Extension API not available');
    return;
  }

  removeTooltip();

  // Position near the right-click location
  let x = e.pageX;
  let y = e.pageY + 10;

  console.log('Right-click detected, looking up:', selection);

  // Send to background for lookup
  try {
    chrome.runtime.sendMessage({ type: 'lookup', word: selection }, (response) => {
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

  subtitleContainer.addEventListener('contextmenu', (e) => {
    const word = window.getSelection().toString().trim();
    if (word.length === 0) return;

    e.preventDefault();

    removeTooltip();
    chrome.runtime.sendMessage({ type: 'lookup', word: word }, (response) => {
      console.log('YouTube lookup response:', response);
      const tooltip = createTooltip(response, e.pageX, e.pageY + 10);
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

console.log('Vocab Helper loaded - Right-click to look up words!');
