chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
        bounds: {
            width: 850,
            height: 525
        }
    });
});
