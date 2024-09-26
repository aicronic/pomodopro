let timer, preferences;

document.addEventListener('DOMContentLoaded', () => {
  loadTimerState();
  setupEventListeners();
});

function loadTimerState() {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    timer = response.timer;
    preferences = response.preferences;
    updateUI();
  });
}

function setupEventListeners() {
  document.getElementById('start-btn').addEventListener('click', startTimer);
  document.getElementById('pause-btn').addEventListener('click', pauseTimer);
  document.getElementById('reset-btn').addEventListener('click', resetTimer);

  document.getElementById('work-duration').addEventListener('input', updateWorkDuration);
  document.getElementById('break-duration').addEventListener('input', updateBreakDuration);
  document.getElementById('long-break-duration').addEventListener('input', updateLongBreakDuration);

  document.getElementById('notifications-toggle').addEventListener('change', updateNotifications);
  document.getElementById('sounds-toggle').addEventListener('change', updateSounds);
  document.getElementById('auto-start-toggle').addEventListener('change', updateAutoStart);
}

function updateUI() {
  const timerDisplay = document.getElementById('timer');
  const minutes = Math.floor(timer.remainingTime / 60);
  const seconds = timer.remainingTime % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  document.getElementById('work-indicator').classList.toggle('active', timer.isWorkSession);
  document.getElementById('break-indicator').classList.toggle('active', !timer.isWorkSession);

  document.getElementById('start-btn').disabled = timer.isRunning;
  document.getElementById('pause-btn').disabled = !timer.isRunning;

  document.getElementById('work-duration').value = timer.workDuration / 60;
  document.getElementById('work-duration-value').textContent = timer.workDuration / 60;
  document.getElementById('break-duration').value = timer.breakDuration / 60;
  document.getElementById('break-duration-value').textContent = timer.breakDuration / 60;
  document.getElementById('long-break-duration').value = timer.longBreakDuration / 60;
  document.getElementById('long-break-duration-value').textContent = timer.longBreakDuration / 60;

  document.getElementById('notifications-toggle').checked = preferences.notifications;
  document.getElementById('sounds-toggle').checked = preferences.sounds;
  document.getElementById('auto-start-toggle').checked = preferences.autoStartNextSession;
}

function startTimer() {
  chrome.runtime.sendMessage({ action: 'startTimer' });
  loadTimerState();
}

function pauseTimer() {
  chrome.runtime.sendMessage({ action: 'pauseTimer' });
  loadTimerState();
}

function resetTimer() {
  chrome.runtime.sendMessage({ action: 'resetTimer' });
  loadTimerState();
}

function updateWorkDuration(event) {
  const newDuration = parseInt(event.target.value) * 60;
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { workDuration: newDuration } });
  loadTimerState();
}

function updateBreakDuration(event) {
  const newDuration = parseInt(event.target.value) * 60;
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { breakDuration: newDuration } });
  loadTimerState();
}

function updateLongBreakDuration(event) {
  const newDuration = parseInt(event.target.value) * 60;
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { longBreakDuration: newDuration } });
  loadTimerState();
}

function updateNotifications(event) {
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { notifications: event.target.checked } });
}

function updateSounds(event) {
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { sounds: event.target.checked } });
}

function updateAutoStart(event) {
  chrome.runtime.sendMessage({ action: 'updatePreferences', preferences: { autoStartNextSession: event.target.checked } });
}

// Update UI every second
setInterval(loadTimerState, 1000);