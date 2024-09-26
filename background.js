let timer = {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 20 * 60,
    remainingTime: 25 * 60,
    isRunning: false,
    isWorkSession: true,
    sessionsCompleted: 0
  };
  
  let preferences = {
    notifications: true,
    sounds: true,
    autoStartNextSession: true
  };
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ timer, preferences });
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroTimer') {
      updateTimer();
    }
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'startTimer':
        startTimer();
        break;
      case 'pauseTimer':
        pauseTimer();
        break;
      case 'resetTimer':
        resetTimer();
        break;
      case 'getTimerState':
        sendResponse({ timer, preferences });
        break;
      case 'updatePreferences':
        updatePreferences(request.preferences);
        break;
    }
  });
  
  function updatePreferences(newPreferences) {
    preferences = { ...preferences, ...newPreferences };
    if (newPreferences.workDuration !== undefined) {
      timer.workDuration = newPreferences.workDuration;
      if (!timer.isRunning && timer.isWorkSession) {
        timer.remainingTime = timer.workDuration;
      }
    }
    if (newPreferences.breakDuration !== undefined) {
      timer.breakDuration = newPreferences.breakDuration;
      if (!timer.isRunning && !timer.isWorkSession && timer.sessionsCompleted % 4 !== 0) {
        timer.remainingTime = timer.breakDuration;
      }
    }
    if (newPreferences.longBreakDuration !== undefined) {
      timer.longBreakDuration = newPreferences.longBreakDuration;
      if (!timer.isRunning && !timer.isWorkSession && timer.sessionsCompleted % 4 === 0) {
        timer.remainingTime = timer.longBreakDuration;
      }
    }
    chrome.storage.local.set({ timer, preferences });
  }


  function startTimer() {
    timer.isRunning = true;
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1/60 });
    updateBadge();
  }
  
  function pauseTimer() {
    timer.isRunning = false;
    chrome.alarms.clear('pomodoroTimer');
    updateBadge();
  }
  
  function resetTimer() {
    timer.isRunning = false;
    timer.isWorkSession = true;
    timer.remainingTime = timer.workDuration;
    timer.sessionsCompleted = 0;
    chrome.alarms.clear('pomodoroTimer');
    updateBadge();
  }
  
  function updateTimer() {
    if (timer.remainingTime > 0) {
      timer.remainingTime--;
    } else {
      if (timer.isWorkSession) {
        timer.sessionsCompleted++;
        if (timer.sessionsCompleted % 4 === 0) {
          timer.remainingTime = timer.longBreakDuration;
        } else {
          timer.remainingTime = timer.breakDuration;
        }
        timer.isWorkSession = false;
      } else {
        timer.remainingTime = timer.workDuration;
        timer.isWorkSession = true;
      }
  
      if (preferences.notifications) {
        showNotification();
      }
      if (preferences.sounds) {
        playSound();
      }
      if (!preferences.autoStartNextSession) {
        pauseTimer();
      }
    }
    updateBadge();
    chrome.storage.local.set({ timer });
  }
  
  function updateBadge() {
    const minutes = Math.floor(timer.remainingTime / 60);
    const seconds = timer.remainingTime % 60;
    const badgeText = timer.isRunning ? `${minutes}:${seconds.toString().padStart(2, '0')}` : 'OFF';
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: timer.isWorkSession ? '#0000FF' : '#FFA500' });
  }
  
  function showNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: timer.isWorkSession ? 'Break Time!' : 'Work Time!',
      message: timer.isWorkSession ? 'Time to take a break.' : 'Time to focus on your work.'
    });
  }
  
  function playSound() {
    // Implement sound playing logic here
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'startTimer':
        startTimer();
        break;
      case 'pauseTimer':
        pauseTimer();
        break;
      case 'resetTimer':
        resetTimer();
        break;
      case 'getTimerState':
        sendResponse({ timer, preferences });
        break;
      case 'updatePreferences':
        preferences = { ...preferences, ...request.preferences };
        chrome.storage.local.set({ preferences });
        break;
    }
  });