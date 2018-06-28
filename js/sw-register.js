//Registration of service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js',{scope: '.'}).then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful');
    }, function(err) {
      // Registration failed
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
