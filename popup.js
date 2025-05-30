// popup.js
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('open-page').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });
});
