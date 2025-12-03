let isEnabled = false;
let targetTabId = null;
let idleTimeout = 60; // 默认60秒
const ALARM_NAME = 'autoReturnAlarm';

// Load settings helper
async function loadSettings() {
  const result = await chrome.storage.local.get(['isEnabled', 'targetTabId', 'idleTimeout']);
  isEnabled = result.isEnabled || false;
  targetTabId = result.targetTabId || null;
  idleTimeout = result.idleTimeout || 60;
}

// 初始化：从storage加载设置
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isEnabled: false,
    targetTabId: null,
    targetTabTitle: '',
    idleTimeout: 60
  });
});

// 启动时加载设置
loadSettings();

// 监听storage变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.isEnabled) {
      isEnabled = changes.isEnabled.newValue;
      if (!isEnabled) {
        clearTimer();
      }
    }
    if (changes.targetTabId) {
      targetTabId = changes.targetTabId.newValue;
    }
    if (changes.idleTimeout) {
      idleTimeout = changes.idleTimeout.newValue;
    }
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USER_ACTIVITY') {
    handleUserActivity().then(() => {
      sendResponse({ success: true });
    });
    return true; // keep channel open
  }
});

async function handleUserActivity() {
  await loadSettings();
  resetTimer();
}

// 监听tab切换事件
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await loadSettings();
  if (!isEnabled || !targetTabId) return;
  
  // 如果切换到目标tab，停止定时器
  if (activeInfo.tabId === targetTabId) {
    clearTimer();
  } else {
    // 切换到其他tab，启动定时器
    resetTimer();
  }
});

// 监听tab关闭事件
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await loadSettings();
  if (tabId === targetTabId) {
    // 目标tab被关闭，重置状态
    targetTabId = null;
    isEnabled = false;
    clearTimer();
    chrome.storage.local.set({
      isEnabled: false,
      targetTabId: null,
      targetTabTitle: ''
    });
  }
});

// 监听定时器报警
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await loadSettings();
    switchToTargetTab();
  }
});

function clearTimer() {
  chrome.alarms.clear(ALARM_NAME);
}

function resetTimer() {
  if (!isEnabled || !targetTabId) return;
  
  // 使用 alarms API 替代 setTimeout，因为 service worker 可能会在30秒后休眠
  chrome.alarms.create(ALARM_NAME, {
    when: Date.now() + (idleTimeout * 1000)
  });
}

async function switchToTargetTab() {
  if (!targetTabId) return;
  
  try {
    // 检查目标tab是否存在
    const tab = await chrome.tabs.get(targetTabId);
    if (tab) {
      // 切换到目标tab
      await chrome.tabs.update(targetTabId, { active: true });
      // 如果tab在其他窗口，也需要聚焦窗口
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } catch (error) {
    // tab不存在，重置状态
    console.log('Target tab not found:', error);
    targetTabId = null;
    isEnabled = false;
    clearTimer();
    chrome.storage.local.set({
      isEnabled: false,
      targetTabId: null,
      targetTabTitle: ''
    });
  }
}
