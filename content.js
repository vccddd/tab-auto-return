// 防抖：避免频繁发送消息
let debounceTimer = null;
const DEBOUNCE_DELAY = 1000; // 1秒防抖

function notifyActivity() {
  if (debounceTimer) return;
  
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
  }, DEBOUNCE_DELAY);
  
  chrome.runtime.sendMessage({ type: 'USER_ACTIVITY' }).catch(() => {
    // 忽略连接错误（例如popup关闭时）
  });
}

// 监听用户活动事件
const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

events.forEach(event => {
  document.addEventListener(event, notifyActivity, { passive: true });
});
