document.addEventListener('DOMContentLoaded', () => {
  const targetDisplay = document.getElementById('targetDisplay');
  const targetTabTitle = document.getElementById('targetTabTitle');
  const setTargetBtn = document.getElementById('setTargetBtn');
  const timeoutInput = document.getElementById('timeoutInput');
  const enableToggle = document.getElementById('enableToggle');
  const status = document.getElementById('status');
  const statusText = document.getElementById('statusText');

  // Display version from manifest
  document.getElementById('appVersion').textContent = chrome.runtime.getManifest().version;

  loadSettings();

  setTargetBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.storage.local.set({
          targetTabId: tab.id,
          targetTabTitle: tab.title || tab.url
        });
        updateTargetTabDisplay(tab.title || tab.url);
        updateToggleState();
      }
    } catch (error) {
      console.error('Failed to set target tab:', error);
    }
  });

  timeoutInput.addEventListener('change', async () => {
    let value = parseInt(timeoutInput.value, 10);
    if (value < 10) value = 10;
    if (value > 3600) value = 3600;
    timeoutInput.value = value;
    await chrome.storage.local.set({ idleTimeout: value });
  });

  enableToggle.addEventListener('change', async () => {
    const isEnabled = enableToggle.checked;
    const result = await chrome.storage.local.get(['targetTabId']);
    
    if (isEnabled && !result.targetTabId) {
      enableToggle.checked = false;
      alert('Please set a target tab first');
      return;
    }
    
    await chrome.storage.local.set({ isEnabled });
    updateStatus(isEnabled);
  });

  async function loadSettings() {
    const result = await chrome.storage.local.get([
      'isEnabled',
      'targetTabId',
      'targetTabTitle',
      'idleTimeout'
    ]);

    if (result.targetTabTitle) {
      updateTargetTabDisplay(result.targetTabTitle);
    }

    if (result.idleTimeout) {
      timeoutInput.value = result.idleTimeout;
    }

    enableToggle.checked = result.isEnabled || false;
    updateStatus(result.isEnabled || false);
    
    if (result.targetTabId) {
      try {
        await chrome.tabs.get(result.targetTabId);
      } catch (e) {
        await chrome.storage.local.set({
          targetTabId: null,
          targetTabTitle: '',
          isEnabled: false
        });
        updateTargetTabDisplay(null);
        enableToggle.checked = false;
        updateStatus(false);
      }
    }
    
    updateToggleState();
  }

  function updateTargetTabDisplay(title) {
    if (title) {
      targetTabTitle.textContent = title;
      targetTabTitle.classList.remove('empty');
      targetDisplay.classList.add('has-target');
    } else {
      targetTabTitle.textContent = 'No tab selected';
      targetTabTitle.classList.add('empty');
      targetDisplay.classList.remove('has-target');
    }
  }

  async function updateToggleState() {
    const result = await chrome.storage.local.get(['targetTabId']);
    enableToggle.disabled = !result.targetTabId;
  }

  function updateStatus(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'Active - Will auto-return after idle timeout';
      status.className = 'status-bar active';
    } else {
      statusText.textContent = 'Disabled';
      status.className = 'status-bar inactive';
    }
  }
});
