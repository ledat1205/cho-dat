function openDashboard() {
  console.log('openDashboard called');

  try {
    if (!chrome || !chrome.tabs) {
      console.error('Chrome tabs API not available');
      alert('Error: Chrome API not available');
      return;
    }

    const url = chrome.runtime.getURL('dashboard.html');
    console.log('Dashboard URL:', url);

    chrome.tabs.create({ url: url }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating tab:', chrome.runtime.lastError);
        alert('Error: ' + chrome.runtime.lastError.message);
      } else {
        console.log('✓ Dashboard tab opened:', tab.id);
        window.close(); // Close the popup after opening dashboard
      }
    });
  } catch (error) {
    console.error('Exception in openDashboard:', error);
    alert('Error: ' + error.message);
  }
}

function openSettings() {
  const url = chrome.runtime.getURL('settings.html');
  console.log('Opening settings:', url);
  chrome.tabs.create({ url }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Error opening settings:', chrome.runtime.lastError);
      alert('Error: ' + chrome.runtime.lastError.message);
    } else {
      console.log('Settings tab opened:', tab.id);
      window.close();
    }
  });
}

// Log when popup loads
console.log('Popup script loaded');

document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
document.getElementById('settingsBtn').addEventListener('click', openSettings);
