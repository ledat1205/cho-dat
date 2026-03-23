function openPage(file) {
  chrome.tabs.create({ url: chrome.runtime.getURL(file) }, () => {
    if (chrome.runtime.lastError) {
      alert('Error: ' + chrome.runtime.lastError.message);
    } else {
      window.close();
    }
  });
}

document.getElementById('dashboardBtn').addEventListener('click', () => openPage('dashboard.html'));
document.getElementById('settingsBtn').addEventListener('click', () => openPage('settings.html'));
