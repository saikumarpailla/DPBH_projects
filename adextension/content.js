var adContainers = document.querySelectorAll('div[id*="ads"], div[class*="ads"], div[data-ad], ins[data-ad-format], [class*="adsbygoogle"], [class*="ad-container"]');
adContainers.forEach(function(container, index) {
  container.style.border = '2px solid red';
  container.style.backgroundColor = 'yellow';

  // Add click event listener to ad elements
  container.addEventListener('click', function(event) {
    var adLinks = container.querySelectorAll('a[href]');
    var hasHiddenLinks = Array.from(adLinks).some(function(link) {
      return link.href !== '' && link.href !== window.location.href;
    });
    if (hasHiddenLinks) {
      var confirmRedirect = confirm("You clicked on an ad. Do you want to be redirected?");
      if (!confirmRedirect) {
        event.preventDefault();
      }
    }
  });

  // Inform the background script about the highlighted ad
  chrome.runtime.sendMessage({ message: 'adHighlighted', adIndex: index });
});
