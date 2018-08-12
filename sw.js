//defining cache
var CACHE_NAME = 'restaurant-review-cache-v1';
var urlsToCache = [
  '/',
  'restaurant.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',

];

//install event will cache the data in browser.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

//fetch event to respond to user requests
self.addEventListener('fetch', function(event) {
  event.respondWith(
    //if the request is presented in cache then serve it
    caches.match(event.request)
      .then(function(response) {
        // If a cache is hit, we can return thre response.
        if (response) {
          return response;
        }

        //Clone the request if it is not in cache.
        var fetchRequest = event.request.clone();

        /*If it is not in cache, try to fetch the response from network
        instead of cache*/
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response fetched from network
            var responseToCache = response.clone();
            //Add data of this reponse to cache, so next time we can serve in offline mode through cache.
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
