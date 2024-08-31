chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === "enable") {
        chrome.action.setIcon({ path: 'icons/icon.png', tabId: sender.tab.id });
    }
});