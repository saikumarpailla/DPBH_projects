document.addEventListener('DOMContentLoaded', function() {
    var adCountDisplay = document.getElementById('adCount');
    var adCounter = 0;
  
    // Listen for a message from the content script to update the ad count
    chrome.runtime.onMessage.addListener(function(request) {
      if (request.message === 'adHighlighted') {
        adCounter = request.adIndex + 1; // Increment counter based on the received index
        adCountDisplay.textContent = 'Ads highlighted: ' + adCounter;
      }
    });
  
    var highlightAdsButton = document.getElementById('highlightAds');
    highlightAdsButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.executeScript(activeTab.id, { file: "content.js" });
      });
    });
  });
  