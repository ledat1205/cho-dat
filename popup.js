function openDashboard() {
  try {
    const url = chrome.runtime.getURL('dashboard.html');
    console.log('Opening dashboard:', url);
    chrome.tabs.create({ url: url }, (tab) => {
      console.log('Dashboard opened:', tab);
    });
  } catch (error) {
    console.error('Error opening dashboard:', error);
    alert('Error: Could not open flashcard dashboard. Check console for details.');
  }
}
