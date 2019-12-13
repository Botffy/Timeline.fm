chrome.runtime.onInstalled.addListener((ev) => {
  if (ev.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});
