const MOCHI_API = 'https://app.mochi.cards/api';

function mochiHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(apiKey + ':')
  };
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + type;
}

async function loadDecks() {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) {
    showStatus('Please enter your Mochi API key first.', 'error');
    return;
  }

  const btn = document.getElementById('loadDecksBtn');
  btn.disabled = true;
  btn.textContent = 'Loading…';
  showStatus('Fetching decks from Mochi…', 'info');

  try {
    const res = await fetch(`${MOCHI_API}/decks`, {
      headers: mochiHeaders(apiKey)
    });

    if (res.status === 401) {
      showStatus('Invalid API key. Please check and try again.', 'error');
      return;
    }
    if (!res.ok) {
      showStatus(`Mochi returned error ${res.status}. Please try again.`, 'error');
      return;
    }

    const data = await res.json();
    const decks = data.docs || [];

    const select = document.getElementById('deckSelect');
    select.innerHTML = '<option value="">— select a deck —</option>';
    decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = deck.name || deck.id;
      select.appendChild(opt);
    });
    select.disabled = false;

    // Restore previously saved deck selection
    chrome.storage.local.get(['mochiDeckId'], (cfg) => {
      if (cfg.mochiDeckId) select.value = cfg.mochiDeckId;
    });

    document.getElementById('loadTemplatesBtn').disabled = false;
    showStatus(`Loaded ${decks.length} deck(s). Select one and click Save.`, 'success');
  } catch (err) {
    showStatus('Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Load Decks';
  }
}

async function loadTemplates() {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) {
    showStatus('Please enter your Mochi API key first.', 'error');
    return;
  }

  const btn = document.getElementById('loadTemplatesBtn');
  btn.disabled = true;
  btn.textContent = 'Loading…';
  showStatus('Fetching templates from Mochi…', 'info');

  try {
    const res = await fetch(`${MOCHI_API}/templates`, {
      headers: mochiHeaders(apiKey)
    });

    if (!res.ok) {
      showStatus(`Mochi returned error ${res.status}.`, 'error');
      return;
    }

    const data = await res.json();
    const templates = data.docs || [];

    const select = document.getElementById('templateSelect');
    select.innerHTML = '<option value="">— select a template —</option>';
    templates.forEach(tmpl => {
      const opt = document.createElement('option');
      opt.value = tmpl.id;
      opt.textContent = tmpl.name || tmpl.id;
      select.appendChild(opt);
    });
    select.disabled = false;

    chrome.storage.local.get(['mochiTemplateId'], (cfg) => {
      if (cfg.mochiTemplateId) select.value = cfg.mochiTemplateId;
    });

    showStatus(`Loaded ${templates.length} template(s). Select one and click Save.`, 'success');
  } catch (err) {
    showStatus('Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Load Templates';
  }
}

// Fetch the deck's template and map field IDs by name
async function fetchTemplateFields(apiKey, deckId) {
  // Get deck to find template-id
  const deckRes = await fetch(`${MOCHI_API}/decks/${deckId}`, {
    headers: mochiHeaders(apiKey)
  });
  if (!deckRes.ok) return null;
  const deck = await deckRes.json();

  const templateId = deck['template-id'];
  if (!templateId) return null;

  // Get template fields (sequential — Mochi allows 1 concurrent request)
  const tmplRes = await fetch(`${MOCHI_API}/templates/${templateId}`, {
    headers: mochiHeaders(apiKey)
  });
  if (!tmplRes.ok) return null;
  const template = await tmplRes.json();

  // Map field IDs by lowercased field name
  const fieldsObj = template.fields || {};
  const fieldMap = {};
  Object.values(fieldsObj).forEach(field => {
    const name = (field.name || '').toLowerCase().trim();
    if (name === 'name') fieldMap.name = field.id;
    else if (name === 'vietnamese') fieldMap.vi = field.id;
    else if (name === 'english dictionary') fieldMap.en = field.id;
    else if (name === 'example') fieldMap.example = field.id;
  });

  console.log('Template fields mapped:', fieldMap);
  return { templateId, fieldMap };
}

async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const deckId = document.getElementById('deckSelect').value;
  const templateId = document.getElementById('templateSelect').value;

  if (!apiKey) {
    showStatus('Please enter your Mochi API key.', 'error');
    return;
  }
  if (!deckId) {
    showStatus('Please select a deck.', 'error');
    return;
  }

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;

  const toStore = { mochiApiKey: apiKey, mochiDeckId: deckId, mochiTemplateId: templateId || null };
  chrome.storage.local.set(toStore, () => {
    if (templateId) {
      showStatus(`Settings saved! Template ID: ${templateId}`, 'success');
    } else {
      showStatus('Settings saved! (No template ID — cards will use plain markdown)', 'success');
    }
    btn.disabled = false;
  });
}

// On page load, restore saved API key and wire up buttons
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loadDecksBtn').addEventListener('click', loadDecks);
  document.getElementById('loadTemplatesBtn').addEventListener('click', loadTemplates);
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  chrome.storage.local.get(['mochiApiKey', 'mochiDeckId', 'mochiTemplateId'], (cfg) => {
    if (cfg.mochiApiKey) {
      document.getElementById('apiKey').value = cfg.mochiApiKey;
      loadDecks();
      loadTemplates();
    }
  });
});
