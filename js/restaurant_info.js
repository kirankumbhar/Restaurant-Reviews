let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  reviewButtonHTML();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  //image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = `/small_images/${restaurant.id}-400_small.jpg`;
  image.alt = `Image of "${restaurant.name}`;
  image.srcset = `/small_images/${restaurant.id}-400_small.jpg 400w, ${DBHelper.imageUrlForRestaurant(restaurant)} 800w`;


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

showReviewForm = () => {
  const container = document.getElementById('maincontent');
  const modal_wrap = document.createElement('div');
  modal_wrap.id = `modal_wrap`

  const form = document.createElement('form');
  form.id = `review-form`;
  form.method = `post`;

  const header = document.createElement('h2');
  header.id = `review-form-header`;
  header.innerHTML = `Submit your Review`;
  form.appendChild(header);

  const rating = document.createElement('fieldset');
  rating.type = `text`;
  rating.className = `rating`;
  rating.id = `rating_fieldset`;

  const ratingLabel = document.createElement('legend');
  ratingLabel.innerHTML = `Rating: `;
  rating.appendChild(ratingLabel);

  //html for 5 star rating using input type radio

  for (var i = 4; i >= 0; i--) {
    //creating radio button
      const radio_star = document.createElement('input');
      radio_star.type = `radio`;
      radio_star.name = `star_rating`;
      radio_star.id = `star-${i}`;
      radio_star.value = i;
      radio_star.className = `rating-input`;
      rating.appendChild(radio_star);

      //creating label for radio button which will use as star
      const radio_star_label = document.createElement('label');
      radio_star_label.htmlFor = radio_star.id;
      radio_star_label.className = `rating-star`;
      rating.appendChild(radio_star_label);

  }

  form.appendChild(rating);
  form.appendChild(document.createElement('br'));

  const name = document.createElement('input');
  name.type = `text`;
  name.id = `fullname`;

  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = name.id;
  nameLabel.innerHTML = `Name: `;

  form.appendChild(nameLabel);
  form.appendChild(name);
  form.appendChild(document.createElement('br'));

  const comments = document.createElement('textarea');
  comments.id = `comments`;

  const commentsLabel = document.createElement('label');
  commentsLabel.for = comments.id;
  commentsLabel.innerHTML = `Comments: `;

  form.appendChild(commentsLabel);
  form.appendChild(comments);
  form.appendChild(document.createElement('br'));

  const submit = document.createElement('button');
  submit.type = `submit`;
  submit.innerHTML = `Submit Review`;
  submit.id = `submit-button`;

  form.appendChild(submit);

  const cancel = document.createElement('button');
  cancel.innerHTML = `Cancel`;
  cancel.id = `cancel-button`;
  cancel.addEventListener('click', function(e){
    e.preventDefault();
    //close class will add visibility: hidden to modal wrap and will close pop-up
    modal_wrap.classList.add('close');
    return false;
  });

  form.appendChild(cancel);
  form.appendChild(document.createElement('br'));

  modal_wrap.appendChild(form);
  container.appendChild(modal_wrap);
}

reviewButtonHTML = () => {
  const container = document.getElementById('reviews-container');
  const button = document.createElement('button');
  button.innerHTML = 'Write Review';
  button.id = 'review-button';
  button.addEventListener('click',function(){
    //check whether review form is already generated by this button
    let form  = document.getElementById(`review-form`);
    if(form == undefined){
      //if review form does not exists, create one.
      showReviewForm();
    }
    else{
      //else remove close class from review form's modal div, to make it visible
      let model_wrap = document.getElementById(`modal_wrap`);
      modal_wrap.classList.remove('close');
    }
  })
  container.appendChild(button);
}
/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  let id=1;
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review,id));
    id=id+1;
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review,id) => {
  const li = document.createElement('li');

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = `review-date`;
  date.id = `review-date-${id}`;
  li.appendChild(date);

  const name = document.createElement('p');
  name.className = `reviewer-name`;
  name.id = `reviewer-name-${id}`;
  name.innerHTML = review.name;
  li.appendChild(name);

  const rating = document.createElement('p');
  console.log(review.rating);
  for (var i = 0; i < review.rating; i++) {
    const star = document.createElement('span');
    star.className = "fa fa-star checked";
    rating.appendChild(star);
  }
  for (var i = review.rating; i < 5; i++) {
    const star = document.createElement('span');
    star.className = "fa fa-star";
    rating.appendChild(star);
  }

  //Adding ARIA semantics to review
  rating.setAttribute('aria-labelledby',`rating-label-div-${review.rating}-${id}`);
  // rating.aria-labelledby = "rating-label-div";
  const labeldiv = document.createElement('div');
  labeldiv.id = `rating-label-div-${review.rating}-${id}`;
  labeldiv.innerHTML = `Rating ${review.rating} out of 5`;
  labeldiv.hidden = true;
  li.appendChild(labeldiv);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.id = `review-comments-${id}`;
  li.appendChild(comments);
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
