// Background script to interact with the active tab
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        var activeTabURL = activeTab.url;

        // Pass the active tab's URL to the content script
        chrome.tabs.executeScript(activeTab.id, { file: "content.js" });

        // Perform any other actions with the URL as needed
        console.log("Active Tab URL:", activeTabURL);
    });
});
