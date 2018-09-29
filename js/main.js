let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();

});
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoic2NvcnBpb25rIiwiYSI6ImNqaXNleXA0ZzBsOWozdnJyYXMzZHFyZ3kifQ.IEY-dNY3duQlpoQi3HvC6A',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image of ${restaurant.name}`;
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  const br= document.createElement('br');
  li.append(br);

  /*
  fav_icon is favourite icon for restaurant
  far fa-star :- star icon with no fill :- indicates not favourite restaurant
  fas fa-star :- star icon with fill :- indicates favourite restaurant
  */
  const fav_icon = document.createElement('i');
  if(restaurant.is_favorite == 'false'){
    fav_icon.className = 'far fa-star';
  }
  else {
    fav_icon.className = 'fas fa-star';
  }

  //fav_icon_btn button of star icon to favourite and unfavourite restaurant.
  const fav_icon_btn = document.createElement('button');
  fav_icon_btn.id = `fav_icon_btn-${restaurant.id}`;
  fav_icon_btn.className = 'fav_icon_btn';
  fav_icon_btn.setAttribute(`aria-label`,`Button to mrak restaurant as favourite`);
  fav_icon_btn.addEventListener('click', function(){
    favouriteRestaurant(restaurant.id)
  });
  fav_icon_btn.append(fav_icon);
  li.append(fav_icon_btn);
  return li
}

// favourite your restaurant
function favouriteRestaurant(id) {
  let btn = document.getElementById(`fav_icon_btn-${id}`);
  let fav_icon = btn.childNodes;
  let fav_icon_class = fav_icon[0].className;
  let toast_msg = document.getElementById(`toast-msg`);
  if (fav_icon_class == 'far fa-star'){   //if false (Restaurant is not favourite)
    //make it true
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=true`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(function(){
      //change the css style of star icon from blank to filled
      fav_icon[0].className = 'fas fa-star';
      //display toast messsage for confirmation
      toast_msg.innerHTML = `Added to favourite Restaurants!`
      toast_msg.className = `show`;
      setTimeout(function(){
        toast_msg.className = toast_msg.className.replace(`show`,``);
      },2000);
    })
    .catch(error => console.error('Error:', error));
  }
  else{
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=false`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(function (){
      //change the css style of star icon from filled to blank
      fav_icon[0].className = 'far fa-star';
      //display toast message for confirmation
      toast_msg.innerHTML = `Removed from favourite Restaurants!`
      toast_msg.className = `show`;
      setTimeout(function(){
        toast_msg.className = toast_msg.className.replace(`show`,``);
      },2000);
    })
    .catch(error => console.error('Error:', error));

  }

}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
