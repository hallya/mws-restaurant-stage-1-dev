'use strict';

/* global DBHelper */
var restaurants = void 0;
var neighborhoods = void 0;
var cuisines = void 0;

var markers = [];

var mainContent = document.querySelector('main'),
    footer = document.querySelector('footer'),
    filterOptions = document.querySelector('.filter-options'),
    filterResultHeading = document.querySelector('.filter-options h3'),
    filterButton = document.querySelector('#menuFilter'),
    listOfRestaurants = document.querySelector('#restaurants-list'),

// sectionRestaurantsList = document.querySelector('#list-container'),
sectionMap = document.querySelector('#map-container'),
    neighborhoodsSelect = document.querySelector('#neighborhoods-select'),
    cuisinesSelect = document.querySelector('#cuisines-select'),
    mapDiv = document.querySelector('#map'),
    loader = document.querySelector('#map-loader');
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (!window.navigator.standalone && window.navigator.userAgent.indexOf('AppleWebKit') > -1) {
    addToHomeScreen();
  }
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Open or close the options/filter menu.
 */
filterButton.addEventListener('click', function () {
  if (filterOptions.classList.contains('optionsClose')) {
    openMenu();
  } else {
    closeMenu();
  }
});
function openMenu() {
  filterOptions.classList.remove('optionsClose');
  mainContent.classList.remove('moveUp');
  footer.classList.remove('moveUp');
  filterOptions.classList.add('optionsOpen');
  filterOptions.setAttribute('aria-hidden', 'false');
  mainContent.classList.add('moveDown');
  footer.classList.add('moveDown');
  filterButton.classList.add('pressed');
  filterButton.blur();
  filterResultHeading.setAttribute('tabindex', '-1');
  filterResultHeading.focus();
}

function closeMenu() {
  filterOptions.classList.remove('optionsOpen');
  filterOptions.classList.add('optionsClose');
  filterOptions.setAttribute('aria-hidden', 'true');
  filterButton.classList.remove('pressed');
  mainContent.classList.remove('moveDown');
  mainContent.classList.add('moveUp');
  footer.classList.remove('moveDown');
  footer.classList.add('moveUp');
  filterResultHeading.removeAttribute('tabindex');
}

/**
 * Register to service worker if the browser is compatible.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
      console.log('registration to serviceWorker complete with scope :', registration.scope);
    });
    navigator.serviceWorker.addEventListener('message', function (event) {
      if (event.data.message === 'confirmed') {
        DBHelper.switchLoaderToMap();
        console.log('Switch done');
      }
    });
  });
}

/**
 * If options/filter menu is open and enter is pressed it makes focus skip to restaurants list.
 */
document.onkeypress = function (e) {
  console.log(e.code);
  if (e.charCode === 13 && filterOptions.classList.contains('optionsOpen')) {
    closeMenu();
    console.log(sectionMap.clientHeight);
    listOfRestaurants.setAttribute('tabindex', '0');
    listOfRestaurants.focus();
    // window.scrollTo(0, sectionMap.clientHeight*2);
  }
};

function activateLazyLoading() {

  var lazyImages = [].slice.call(document.querySelectorAll('.lazy'));

  if ('IntersectionObserver' in window) {
    console.log('Starting intersectionObserver');
    var lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var lazyImage = entry.target;
          if (lazyImage.localName === 'source') {
            lazyImage.srcset = lazyImage.dataset.srcset;
          } else {
            lazyImage.src = lazyImage.dataset.src;
          }

          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
    var _lazyImages = [].slice.call(document.querySelectorAll('.lazy'));
    var active = false;
    console.log('Starting adaptative lazy loading');
    var lazyLoad = function lazyLoad() {
      if (active === false) {
        active = true;

        setTimeout(function () {
          _lazyImages.forEach(function (lazyImage) {
            if (lazyImage.getBoundingClientRect().top <= window.innerHeight + 50 && lazyImage.getBoundingClientRect().bottom >= 0 && getComputedStyle(lazyImage).display !== "none") {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.srcset = lazyImage.dataset.srcset;
              lazyImage.classList.remove('lazy');

              _lazyImages = _lazyImages.filter(function (image) {
                return image !== lazyImage;
              });

              if (_lazyImages.length === 0) {
                document.removeEventListener('scroll', lazyLoad);
                window.removeEventListener('resize', lazyLoad);
                window.removeEventListener('orientationchange', lazyLoad);
              }
            }
          });

          active = false;
        }, 200);
      }
    };
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationchange', lazyLoad);
  }
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods().then(function (neighborhoods) {
    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  }).catch(function (error) {
    return console.error(error);
  });
};

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

  var select = neighborhoodsSelect;
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-setsize', '4');
    option.setAttribute('aria-posinset', neighborhoods.indexOf(neighborhood) + 2);
    select.append(option);
  });
};
/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = function fetchCuisines() {
  DBHelper.fetchCuisines().then(function (cuisines) {
    self.cuisines = cuisines;
    fillCuisinesHTML();
  }).catch(function (error) {
    return console.error(error);
  });
};

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

  var select = cuisinesSelect;
  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-setsize', '4');
    option.setAttribute('aria-posinset', cuisines.indexOf(cuisine) + 2);
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {

  var loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  self.map.addListener('idle', function () {
    DBHelper.switchLoaderToMap();
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = function updateRestaurants() {
  var cSelect = cuisinesSelect;
  var nSelect = neighborhoodsSelect;

  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;

  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(function (restaurants) {
    resetRestaurants(restaurants);
    fillRestaurantsHTML();
  }).catch(function (error) {
    return console.error(error);
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers

  self.markers.forEach(function (m) {
    return m.setMap(null);
  });
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var ul = document.getElementById('restaurants-list');
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  console.log('Restaurants HTML filled');
  activateLazyLoading();
  // setTimeout(() => switchLoaderToMap(), 5000);
};

/**
 * Return the average note of the restaurant.
 */
var getAverageNote = function getAverageNote(reviews) {
  var averageNote = 0;
  reviews.forEach(function (review) {
    averageNote = averageNote + Number(review.rating);
  });
  averageNote = averageNote / reviews.length;
  return Math.round(averageNote * 10) / 10;
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = function createRestaurantHTML(restaurant) {

  var li = document.createElement('li');
  var figure = document.createElement('figure');
  var figcaption = document.createElement('figcaption');
  var picture = document.createElement('picture');
  var source = document.createElement('source');
  var secondSource = document.createElement('source');
  var thSource = document.createElement('source');
  var sourceWebp = document.createElement('source');
  var secondSourceWebp = document.createElement('source');
  var thSourceWebp = document.createElement('source');
  var image = document.createElement('img');
  var containerNote = document.createElement('aside');
  var note = document.createElement('p');

  sourceWebp.dataset.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-large_x1.webp 1x, ' + DBHelper.imageWebpUrlForRestaurant(restaurant) + '-large_x2.webp 2x';
  sourceWebp.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-lazy.webp';
  sourceWebp.media = '(min-width: 1000px)';
  sourceWebp.className = 'lazy';
  sourceWebp.type = 'image/webp';
  source.dataset.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-large_x1.jpg 1x, ' + DBHelper.imageUrlForRestaurant(restaurant) + '-large_x2.jpg 2x';
  source.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-lazy.jpg';
  source.media = '(min-width: 1000px)';
  source.className = 'lazy';
  source.type = 'image/jpeg';

  secondSourceWebp.dataset.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-medium_x1.webp 1x, ' + DBHelper.imageWebpUrlForRestaurant(restaurant) + '-medium_x2.webp 2x';
  secondSourceWebp.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-lazy.webp';
  secondSourceWebp.media = '(min-width: 420px)';
  secondSourceWebp.className = 'lazy';
  secondSourceWebp.type = 'image/webp';
  secondSource.dataset.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-medium_x1.jpg 1x, ' + DBHelper.imageUrlForRestaurant(restaurant) + '-medium_x2.jpg 2x';
  secondSource.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-lazy.jpg';
  secondSource.media = '(min-width: 420px)';
  secondSource.className = 'lazy';
  secondSource.type = 'image/jpeg';

  thSourceWebp.dataset.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-small_x2.webp 2x, ' + DBHelper.imageWebpUrlForRestaurant(restaurant) + '-small_x1.webp 1x';
  thSourceWebp.srcset = DBHelper.imageWebpUrlForRestaurant(restaurant) + '-lazy.webp';
  thSourceWebp.media = '(min-width: 320px)';
  thSourceWebp.className = 'lazy';
  thSourceWebp.type = 'image/webp';
  thSource.dataset.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-small_x2.jpg 2x, ' + DBHelper.imageUrlForRestaurant(restaurant) + '-small_x1.jpg 1x';
  thSource.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '-lazy.jpg';
  thSource.media = '(min-width: 320px)';
  thSource.className = 'lazy';
  thSource.type = 'image/jpeg';

  image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant) + '-small_x1.jpg';
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '-lazy.jpg';
  image.className = 'restaurant-img lazy';
  image.setAttribute('sizes', '(max-width: 1100px) 85vw, (min-width: 1101px) 990px');
  image.alt = restaurant.name + '\'s restaurant';
  image.type = 'image/jpeg';

  note.innerHTML = getAverageNote(restaurant.reviews) + '/5';

  containerNote.append(note);

  picture.append(sourceWebp);
  picture.append(source);
  picture.append(secondSourceWebp);
  picture.append(secondSource);
  picture.append(thSourceWebp);
  picture.append(thSource);
  picture.append(image);
  figure.append(picture);
  figure.append(figcaption);

  li.append(containerNote);
  li.append(figure);

  var name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  figcaption.append(name);

  var neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  var address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  var more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View details of ' + restaurant.name);
  li.append(more);

  li.setAttribute('role', 'listitem');
  li.setAttribute('aria-setsize', '10');
  li.setAttribute('aria-posinset', restaurant.id);
  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = function addMarkersToMap() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', function () {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

var addToHomeScreen = function addToHomeScreen() {
  var aside = document.createElement('aside');
  var note = document.createElement('p');
  var msg = document.createElement('p');
  var span = document.createElement('span');

  aside.id = 'pop';

  aside.className = 'popup';
  msg.className = 'popup msg';
  msg.setAttribute('tabindex', '2');
  note.className = 'popup note';
  note.setAttribute('tabindex', '1');
  span.className = 'iconicfill-arrow-down';

  note.innerHTML = '(Tap to close)';
  msg.innerHTML = 'Add <img src="assets/img/svg/share-apple.svg" alt=""> this app to your home screen and enjoy it as a real application !';

  aside.setAttribute('tabindex', '-1');
  aside.addEventListener('click', function () {
    aside.classList.add('hide');
    document.getElementsByTagName('h1').focus();
    setTimeout(function () {
      aside.style = 'display: none;';
    }, 1000);
  });
  aside.append(note);
  aside.append(msg);
  aside.append(span);
  document.getElementById('maincontent').appendChild(aside);
  aside.focus();
  aside.focus();
  setTimeout(function () {
    aside.classList.add('hide');
  }, 7000);
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsicmVzdGF1cmFudHMiLCJuZWlnaGJvcmhvb2RzIiwiY3Vpc2luZXMiLCJtYXJrZXJzIiwibWFpbkNvbnRlbnQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJmb290ZXIiLCJmaWx0ZXJPcHRpb25zIiwiZmlsdGVyUmVzdWx0SGVhZGluZyIsImZpbHRlckJ1dHRvbiIsImxpc3RPZlJlc3RhdXJhbnRzIiwic2VjdGlvbk1hcCIsIm5laWdoYm9yaG9vZHNTZWxlY3QiLCJjdWlzaW5lc1NlbGVjdCIsIm1hcERpdiIsImxvYWRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJ3aW5kb3ciLCJuYXZpZ2F0b3IiLCJzdGFuZGFsb25lIiwidXNlckFnZW50IiwiaW5kZXhPZiIsImFkZFRvSG9tZVNjcmVlbiIsImZldGNoTmVpZ2hib3Job29kcyIsImZldGNoQ3Vpc2luZXMiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwicmVtb3ZlIiwiYWRkIiwic2V0QXR0cmlidXRlIiwiYmx1ciIsImZvY3VzIiwicmVtb3ZlQXR0cmlidXRlIiwic2VydmljZVdvcmtlciIsInJlZ2lzdGVyIiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJyZWdpc3RyYXRpb24iLCJzY29wZSIsImV2ZW50IiwiZGF0YSIsIm1lc3NhZ2UiLCJEQkhlbHBlciIsInN3aXRjaExvYWRlclRvTWFwIiwib25rZXlwcmVzcyIsImUiLCJjb2RlIiwiY2hhckNvZGUiLCJjbGllbnRIZWlnaHQiLCJhY3RpdmF0ZUxhenlMb2FkaW5nIiwibGF6eUltYWdlcyIsInNsaWNlIiwiY2FsbCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsYXp5SW1hZ2VPYnNlcnZlciIsIkludGVyc2VjdGlvbk9ic2VydmVyIiwiZW50cmllcyIsIm9ic2VydmVyIiwiZm9yRWFjaCIsImVudHJ5IiwiaXNJbnRlcnNlY3RpbmciLCJsYXp5SW1hZ2UiLCJ0YXJnZXQiLCJsb2NhbE5hbWUiLCJzcmNzZXQiLCJkYXRhc2V0Iiwic3JjIiwidW5vYnNlcnZlIiwib2JzZXJ2ZSIsImFjdGl2ZSIsImxhenlMb2FkIiwic2V0VGltZW91dCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsImlubmVySGVpZ2h0IiwiYm90dG9tIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImRpc3BsYXkiLCJmaWx0ZXIiLCJpbWFnZSIsImxlbmd0aCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzZWxmIiwiZmlsbE5laWdoYm9yaG9vZHNIVE1MIiwiY2F0Y2giLCJlcnJvciIsInNlbGVjdCIsIm9wdGlvbiIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJuZWlnaGJvcmhvb2QiLCJ2YWx1ZSIsImFwcGVuZCIsImZpbGxDdWlzaW5lc0hUTUwiLCJjdWlzaW5lIiwiaW5pdE1hcCIsImxvYyIsImxhdCIsImxuZyIsIm1hcCIsImdvb2dsZSIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50QnlJZCIsInpvb20iLCJjZW50ZXIiLCJzY3JvbGx3aGVlbCIsImFkZExpc3RlbmVyIiwidXBkYXRlUmVzdGF1cmFudHMiLCJjU2VsZWN0IiwiblNlbGVjdCIsImNJbmRleCIsInNlbGVjdGVkSW5kZXgiLCJuSW5kZXgiLCJmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QiLCJyZXNldFJlc3RhdXJhbnRzIiwiZmlsbFJlc3RhdXJhbnRzSFRNTCIsInVsIiwibSIsInNldE1hcCIsImNyZWF0ZVJlc3RhdXJhbnRIVE1MIiwicmVzdGF1cmFudCIsImFkZE1hcmtlcnNUb01hcCIsImdldEF2ZXJhZ2VOb3RlIiwicmV2aWV3cyIsImF2ZXJhZ2VOb3RlIiwiTnVtYmVyIiwicmV2aWV3IiwicmF0aW5nIiwiTWF0aCIsInJvdW5kIiwibGkiLCJmaWd1cmUiLCJmaWdjYXB0aW9uIiwicGljdHVyZSIsInNvdXJjZSIsInNlY29uZFNvdXJjZSIsInRoU291cmNlIiwic291cmNlV2VicCIsInNlY29uZFNvdXJjZVdlYnAiLCJ0aFNvdXJjZVdlYnAiLCJjb250YWluZXJOb3RlIiwibm90ZSIsImltYWdlV2VicFVybEZvclJlc3RhdXJhbnQiLCJtZWRpYSIsImNsYXNzTmFtZSIsInR5cGUiLCJpbWFnZVVybEZvclJlc3RhdXJhbnQiLCJhbHQiLCJuYW1lIiwiYWRkcmVzcyIsIm1vcmUiLCJocmVmIiwidXJsRm9yUmVzdGF1cmFudCIsImlkIiwibWFya2VyIiwibWFwTWFya2VyRm9yUmVzdGF1cmFudCIsImxvY2F0aW9uIiwidXJsIiwicHVzaCIsImFzaWRlIiwibXNnIiwic3BhbiIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3R5bGUiLCJhcHBlbmRDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQUlBLG9CQUFKO0FBQ0EsSUFBSUMsc0JBQUo7QUFDQSxJQUFJQyxpQkFBSjs7QUFFQSxJQUFJQyxVQUFVLEVBQWQ7O0FBRUEsSUFBTUMsY0FBY0MsU0FBU0MsYUFBVCxDQUF1QixNQUF2QixDQUFwQjtBQUFBLElBQ0VDLFNBQVNGLFNBQVNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FEWDtBQUFBLElBRUVFLGdCQUFnQkgsU0FBU0MsYUFBVCxDQUF1QixpQkFBdkIsQ0FGbEI7QUFBQSxJQUdFRyxzQkFBc0JKLFNBQVNDLGFBQVQsQ0FBdUIsb0JBQXZCLENBSHhCO0FBQUEsSUFJRUksZUFBZUwsU0FBU0MsYUFBVCxDQUF1QixhQUF2QixDQUpqQjtBQUFBLElBS0VLLG9CQUFvQk4sU0FBU0MsYUFBVCxDQUF1QixtQkFBdkIsQ0FMdEI7O0FBTUU7QUFDQU0sYUFBYVAsU0FBU0MsYUFBVCxDQUF1QixnQkFBdkIsQ0FQZjtBQUFBLElBUUVPLHNCQUFzQlIsU0FBU0MsYUFBVCxDQUF1Qix1QkFBdkIsQ0FSeEI7QUFBQSxJQVNFUSxpQkFBaUJULFNBQVNDLGFBQVQsQ0FBdUIsa0JBQXZCLENBVG5CO0FBQUEsSUFVRVMsU0FBU1YsU0FBU0MsYUFBVCxDQUF1QixNQUF2QixDQVZYO0FBQUEsSUFXRVUsU0FBU1gsU0FBU0MsYUFB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RCxHQU5EO0FBT0FKLFFBQU1wRSxNQUFOLENBQWFrRCxJQUFiO0FBQ0FrQixRQUFNcEUsTUFBTixDQUFhcUUsR0FBYjtBQUNBRCxRQUFNcEUsTUFBTixDQUFhc0UsSUFBYjtBQUNBakssV0FBU3NHLGNBQVQsQ0FBd0IsYUFBeEIsRUFBdUM4RCxXQUF2QyxDQUFtREwsS0FBbkQ7QUFDQUEsUUFBTWxJLEtBQU47QUFDQWtJLFFBQU1sSSxLQUFOO0FBQ0F5QyxhQUFXLFlBQU07QUFDZnlGLFVBQU0xSSxTQUFOLENBQWdCSyxHQUFoQixDQUFvQixNQUFwQjtBQUNELEdBRkQsRUFFRyxJQUZIO0FBR0QsQ0FuQ0QiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBEQkhlbHBlciAqL1xyXG5sZXQgcmVzdGF1cmFudHM7XHJcbmxldCBuZWlnaGJvcmhvb2RzO1xyXG5sZXQgY3Vpc2luZXM7XHJcblxyXG52YXIgbWFya2VycyA9IFtdO1xyXG5cclxuY29uc3QgbWFpbkNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtYWluJyksXHJcbiAgZm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9vdGVyJyksXHJcbiAgZmlsdGVyT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maWx0ZXItb3B0aW9ucycpLFxyXG4gIGZpbHRlclJlc3VsdEhlYWRpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmlsdGVyLW9wdGlvbnMgaDMnKSxcclxuICBmaWx0ZXJCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVudUZpbHRlcicpLFxyXG4gIGxpc3RPZlJlc3RhdXJhbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlc3RhdXJhbnRzLWxpc3QnKSxcclxuICAvLyBzZWN0aW9uUmVzdGF1cmFudHNMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3QtY29udGFpbmVyJyksXHJcbiAgc2VjdGlvbk1hcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYXAtY29udGFpbmVyJyksXHJcbiAgbmVpZ2hib3Job29kc1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZWlnaGJvcmhvb2RzLXNlbGVjdCcpLFxyXG4gIGN1aXNpbmVzU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2N1aXNpbmVzLXNlbGVjdCcpLFxyXG4gIG1hcERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYXAnKSxcclxuICBsb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFwLWxvYWRlcicpO1xyXG4vKipcclxuICogRmV0Y2ggbmVpZ2hib3Job29kcyBhbmQgY3Vpc2luZXMgYXMgc29vbiBhcyB0aGUgcGFnZSBpcyBsb2FkZWQuXHJcbiAqL1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xyXG4gIGlmICghd2luZG93Lm5hdmlnYXRvci5zdGFuZGFsb25lICYmIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0FwcGxlV2ViS2l0JykgPiAtMSkge1xyXG4gICAgYWRkVG9Ib21lU2NyZWVuKCk7XHJcbiAgfVxyXG4gIGZldGNoTmVpZ2hib3Job29kcygpO1xyXG4gIGZldGNoQ3Vpc2luZXMoKTtcclxufSk7XHJcblxyXG5cclxuLyoqXHJcbiAqIE9wZW4gb3IgY2xvc2UgdGhlIG9wdGlvbnMvZmlsdGVyIG1lbnUuXHJcbiAqL1xyXG5maWx0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgaWYgKGZpbHRlck9wdGlvbnMuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcHRpb25zQ2xvc2UnKSkge1xyXG4gICAgb3Blbk1lbnUoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY2xvc2VNZW51KCk7XHJcbiAgfVxyXG59KTtcclxuZnVuY3Rpb24gb3Blbk1lbnUoKSB7XHJcbiAgZmlsdGVyT3B0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdvcHRpb25zQ2xvc2UnKTtcclxuICBtYWluQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdtb3ZlVXAnKTtcclxuICBmb290ZXIuY2xhc3NMaXN0LnJlbW92ZSgnbW92ZVVwJyk7XHJcbiAgZmlsdGVyT3B0aW9ucy5jbGFzc0xpc3QuYWRkKCdvcHRpb25zT3BlbicpO1xyXG4gIGZpbHRlck9wdGlvbnMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xyXG4gIG1haW5Db250ZW50LmNsYXNzTGlzdC5hZGQoJ21vdmVEb3duJyk7XHJcbiAgZm9vdGVyLmNsYXNzTGlzdC5hZGQoJ21vdmVEb3duJyk7XHJcbiAgZmlsdGVyQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3ByZXNzZWQnKTtcclxuICBmaWx0ZXJCdXR0b24uYmx1cigpO1xyXG4gIGZpbHRlclJlc3VsdEhlYWRpbmcuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xyXG4gIGZpbHRlclJlc3VsdEhlYWRpbmcuZm9jdXMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gIGZpbHRlck9wdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnb3B0aW9uc09wZW4nKTtcclxuICBmaWx0ZXJPcHRpb25zLmNsYXNzTGlzdC5hZGQoJ29wdGlvbnNDbG9zZScpO1xyXG4gIGZpbHRlck9wdGlvbnMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XHJcbiAgZmlsdGVyQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3ByZXNzZWQnKTtcclxuICBtYWluQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCdtb3ZlRG93bicpO1xyXG4gIG1haW5Db250ZW50LmNsYXNzTGlzdC5hZGQoJ21vdmVVcCcpO1xyXG4gIGZvb3Rlci5jbGFzc0xpc3QucmVtb3ZlKCdtb3ZlRG93bicpO1xyXG4gIGZvb3Rlci5jbGFzc0xpc3QuYWRkKCdtb3ZlVXAnKTtcclxuICBmaWx0ZXJSZXN1bHRIZWFkaW5nLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIHRvIHNlcnZpY2Ugd29ya2VyIGlmIHRoZSBicm93c2VyIGlzIGNvbXBhdGlibGUuXHJcbiAqL1xyXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3N3LmpzJykudGhlbihyZWdpc3RyYXRpb24gPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygncmVnaXN0cmF0aW9uIHRvIHNlcnZpY2VXb3JrZXIgY29tcGxldGUgd2l0aCBzY29wZSA6JywgcmVnaXN0cmF0aW9uLnNjb3BlKTtcclxuICAgIH0pO1xyXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xyXG4gICAgICBpZiAoZXZlbnQuZGF0YS5tZXNzYWdlID09PSAnY29uZmlybWVkJykge1xyXG4gICAgICAgIERCSGVscGVyLnN3aXRjaExvYWRlclRvTWFwKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1N3aXRjaCBkb25lJyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIElmIG9wdGlvbnMvZmlsdGVyIG1lbnUgaXMgb3BlbiBhbmQgZW50ZXIgaXMgcHJlc3NlZCBpdCBtYWtlcyBmb2N1cyBza2lwIHRvIHJlc3RhdXJhbnRzIGxpc3QuXHJcbiAqL1xyXG5kb2N1bWVudC5vbmtleXByZXNzID0gZnVuY3Rpb24gKGUpIHtcclxuICBjb25zb2xlLmxvZyhlLmNvZGUpO1xyXG4gIGlmIChlLmNoYXJDb2RlID09PSAxMyAmJiBmaWx0ZXJPcHRpb25zLmNsYXNzTGlzdC5jb250YWlucygnb3B0aW9uc09wZW4nKSkge1xyXG4gICAgY2xvc2VNZW51KCk7XHJcbiAgICBjb25zb2xlLmxvZyhzZWN0aW9uTWFwLmNsaWVudEhlaWdodCk7XHJcbiAgICBsaXN0T2ZSZXN0YXVyYW50cy5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcclxuICAgIGxpc3RPZlJlc3RhdXJhbnRzLmZvY3VzKCk7XHJcbiAgICAvLyB3aW5kb3cuc2Nyb2xsVG8oMCwgc2VjdGlvbk1hcC5jbGllbnRIZWlnaHQqMik7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZUxhenlMb2FkaW5nKCkge1xyXG4gIFxyXG4gIHZhciBsYXp5SW1hZ2VzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubGF6eScpKTtcclxuXHJcbiAgaWYgKCdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU3RhcnRpbmcgaW50ZXJzZWN0aW9uT2JzZXJ2ZXInKTtcclxuICAgIGxldCBsYXp5SW1hZ2VPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihmdW5jdGlvbiAoZW50cmllcywgb2JzZXJ2ZXIpIHtcclxuICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xyXG4gICAgICAgICAgbGV0IGxhenlJbWFnZSA9IGVudHJ5LnRhcmdldDtcclxuICAgICAgICAgIGlmIChsYXp5SW1hZ2UubG9jYWxOYW1lID09PSAnc291cmNlJykge1xyXG4gICAgICAgICAgICBsYXp5SW1hZ2Uuc3Jjc2V0ID0gbGF6eUltYWdlLmRhdGFzZXQuc3Jjc2V0O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGF6eUltYWdlLnNyYyA9IGxhenlJbWFnZS5kYXRhc2V0LnNyYztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsYXp5SW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgnbGF6eScpO1xyXG4gICAgICAgICAgbGF6eUltYWdlT2JzZXJ2ZXIudW5vYnNlcnZlKGxhenlJbWFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxhenlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbiAobGF6eUltYWdlKSB7XHJcbiAgICAgIGxhenlJbWFnZU9ic2VydmVyLm9ic2VydmUobGF6eUltYWdlKTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBQb3NzaWJseSBmYWxsIGJhY2sgdG8gYSBtb3JlIGNvbXBhdGlibGUgbWV0aG9kIGhlcmVcclxuICAgIGxldCBsYXp5SW1hZ2VzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubGF6eScpKTtcclxuICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBhZGFwdGF0aXZlIGxhenkgbG9hZGluZycpO1xyXG4gICAgY29uc3QgbGF6eUxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChhY3RpdmUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBsYXp5SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24gKGxhenlJbWFnZSkge1xyXG4gICAgICAgICAgICBpZiAoKGxhenlJbWFnZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPD0gKHdpbmRvdy5pbm5lckhlaWdodCArIDUwKSAmJiBsYXp5SW1hZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tID49IDApICYmIGdldENvbXB1dGVkU3R5bGUobGF6eUltYWdlKS5kaXNwbGF5ICE9PSBcIm5vbmVcIikge1xyXG4gICAgICAgICAgICAgIGxhenlJbWFnZS5zcmMgPSBsYXp5SW1hZ2UuZGF0YXNldC5zcmM7XHJcbiAgICAgICAgICAgICAgbGF6eUltYWdlLnNyY3NldCA9IGxhenlJbWFnZS5kYXRhc2V0LnNyY3NldDtcclxuICAgICAgICAgICAgICBsYXp5SW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgnbGF6eScpO1xyXG5cclxuICAgICAgICAgICAgICBsYXp5SW1hZ2VzID0gbGF6eUltYWdlcy5maWx0ZXIoZnVuY3Rpb24gKGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2UgIT09IGxhenlJbWFnZTtcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGxhenlJbWFnZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBsYXp5TG9hZCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgbGF6eUxvYWQpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgbGF6eUxvYWQpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGxhenlMb2FkKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBsYXp5TG9hZCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCBsYXp5TG9hZCk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIEZldGNoIGFsbCBuZWlnaGJvcmhvb2RzIGFuZCBzZXQgdGhlaXIgSFRNTC5cclxuICovXHJcbmNvbnN0IGZldGNoTmVpZ2hib3Job29kcyA9ICgpID0+IHtcclxuICBEQkhlbHBlci5mZXRjaE5laWdoYm9yaG9vZHMoKVxyXG4gICAgLnRoZW4obmVpZ2hib3Job29kcyA9PiB7XHJcbiAgICAgIHNlbGYubmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHM7XHJcbiAgICAgIGZpbGxOZWlnaGJvcmhvb2RzSFRNTCgpO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IG5laWdoYm9yaG9vZHMgSFRNTC5cclxuICovXHJcbmNvbnN0IGZpbGxOZWlnaGJvcmhvb2RzSFRNTCA9IChuZWlnaGJvcmhvb2RzID0gc2VsZi5uZWlnaGJvcmhvb2RzKSA9PiB7XHJcbiAgY29uc3Qgc2VsZWN0ID0gbmVpZ2hib3Job29kc1NlbGVjdDtcclxuICBuZWlnaGJvcmhvb2RzLmZvckVhY2gobmVpZ2hib3Job29kID0+IHtcclxuICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgb3B0aW9uLmlubmVySFRNTCA9IG5laWdoYm9yaG9vZDtcclxuICAgIG9wdGlvbi52YWx1ZSA9IG5laWdoYm9yaG9vZDtcclxuICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnb3B0aW9uJyk7XHJcbiAgICBvcHRpb24uc2V0QXR0cmlidXRlKCdhcmlhLXNldHNpemUnLCAnNCcpO1xyXG4gICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wb3NpbnNldCcsIG5laWdoYm9yaG9vZHMuaW5kZXhPZihuZWlnaGJvcmhvb2QpKzIpO1xyXG4gICAgc2VsZWN0LmFwcGVuZChvcHRpb24pO1xyXG4gIH0pO1xyXG59O1xyXG4vKipcclxuICogRmV0Y2ggYWxsIGN1aXNpbmVzIGFuZCBzZXQgdGhlaXIgSFRNTC5cclxuICovXHJcbmNvbnN0IGZldGNoQ3Vpc2luZXMgPSAoKSA9PiB7XHJcbiAgREJIZWxwZXIuZmV0Y2hDdWlzaW5lcygpXHJcbiAgICAudGhlbihjdWlzaW5lcyA9PiB7XHJcbiAgICAgIHNlbGYuY3Vpc2luZXMgPSBjdWlzaW5lcztcclxuICAgICAgZmlsbEN1aXNpbmVzSFRNTCgpO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1aXNpbmVzIEhUTUwuXHJcbiAqL1xyXG5jb25zdCBmaWxsQ3Vpc2luZXNIVE1MID0gKGN1aXNpbmVzID0gc2VsZi5jdWlzaW5lcykgPT4ge1xyXG4gIGNvbnN0IHNlbGVjdCA9IGN1aXNpbmVzU2VsZWN0O1xyXG4gIGN1aXNpbmVzLmZvckVhY2goY3Vpc2luZSA9PiB7XHJcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgIG9wdGlvbi5pbm5lckhUTUwgPSBjdWlzaW5lO1xyXG4gICAgb3B0aW9uLnZhbHVlID0gY3Vpc2luZTtcclxuICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnb3B0aW9uJyk7XHJcbiAgICBvcHRpb24uc2V0QXR0cmlidXRlKCdhcmlhLXNldHNpemUnLCAnNCcpO1xyXG4gICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wb3NpbnNldCcsIGN1aXNpbmVzLmluZGV4T2YoY3Vpc2luZSkgKyAyKTtcclxuICAgIHNlbGVjdC5hcHBlbmQob3B0aW9uKTtcclxuICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIEdvb2dsZSBtYXAsIGNhbGxlZCBmcm9tIEhUTUwuXHJcbiAqL1xyXG53aW5kb3cuaW5pdE1hcCA9ICgpID0+IHtcclxuXHJcbiAgbGV0IGxvYyA9IHtcclxuICAgIGxhdDogNDAuNzIyMjE2LFxyXG4gICAgbG5nOiAtNzMuOTg3NTAxXHJcbiAgfTtcclxuICBzZWxmLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XHJcbiAgICB6b29tOiAxMixcclxuICAgIGNlbnRlcjogbG9jLFxyXG4gICAgc2Nyb2xsd2hlZWw6IGZhbHNlXHJcbiAgfSk7XHJcblxyXG4gIHNlbGYubWFwLmFkZExpc3RlbmVyKCdpZGxlJywgKCkgPT4ge1xyXG4gICAgREJIZWxwZXIuc3dpdGNoTG9hZGVyVG9NYXAoKTtcclxuICB9KTtcclxuICB1cGRhdGVSZXN0YXVyYW50cygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSBwYWdlIGFuZCBtYXAgZm9yIGN1cnJlbnQgcmVzdGF1cmFudHMuXHJcbiAqL1xyXG5jb25zdCB1cGRhdGVSZXN0YXVyYW50cyA9ICgpID0+IHtcclxuICBjb25zdCBjU2VsZWN0ID0gY3Vpc2luZXNTZWxlY3Q7XHJcbiAgY29uc3QgblNlbGVjdCA9IG5laWdoYm9yaG9vZHNTZWxlY3Q7XHJcblxyXG4gIGNvbnN0IGNJbmRleCA9IGNTZWxlY3Quc2VsZWN0ZWRJbmRleDtcclxuICBjb25zdCBuSW5kZXggPSBuU2VsZWN0LnNlbGVjdGVkSW5kZXg7XHJcblxyXG4gIGNvbnN0IGN1aXNpbmUgPSBjU2VsZWN0W2NJbmRleF0udmFsdWU7XHJcbiAgY29uc3QgbmVpZ2hib3Job29kID0gblNlbGVjdFtuSW5kZXhdLnZhbHVlO1xyXG5cclxuICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kKVxyXG4gICAgLnRoZW4ocmVzdGF1cmFudHMgPT4ge1xyXG4gICAgICByZXNldFJlc3RhdXJhbnRzKHJlc3RhdXJhbnRzKTtcclxuICAgICAgZmlsbFJlc3RhdXJhbnRzSFRNTCgpO1xyXG4gICAgfSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENsZWFyIGN1cnJlbnQgcmVzdGF1cmFudHMsIHRoZWlyIEhUTUwgYW5kIHJlbW92ZSB0aGVpciBtYXAgbWFya2Vycy5cclxuICovXHJcbmNvbnN0IHJlc2V0UmVzdGF1cmFudHMgPSAocmVzdGF1cmFudHMpID0+IHtcclxuICAvLyBSZW1vdmUgYWxsIHJlc3RhdXJhbnRzXHJcbiAgc2VsZi5yZXN0YXVyYW50cyA9IFtdO1xyXG4gIGNvbnN0IHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnRzLWxpc3QnKTtcclxuICB1bC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgLy8gUmVtb3ZlIGFsbCBtYXAgbWFya2Vyc1xyXG5cclxuICBzZWxmLm1hcmtlcnMuZm9yRWFjaChtID0+IG0uc2V0TWFwKG51bGwpKTtcclxuICBzZWxmLm1hcmtlcnMgPSBbXTtcclxuICBzZWxmLnJlc3RhdXJhbnRzID0gcmVzdGF1cmFudHM7XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGFsbCByZXN0YXVyYW50cyBIVE1MIGFuZCBhZGQgdGhlbSB0byB0aGUgd2VicGFnZS5cclxuICovXHJcbmNvbnN0IGZpbGxSZXN0YXVyYW50c0hUTUwgPSAocmVzdGF1cmFudHMgPSBzZWxmLnJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgY29uc3QgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudHMtbGlzdCcpO1xyXG4gIHJlc3RhdXJhbnRzLmZvckVhY2gocmVzdGF1cmFudCA9PiB7XHJcbiAgICB1bC5hcHBlbmQoY3JlYXRlUmVzdGF1cmFudEhUTUwocmVzdGF1cmFudCkpO1xyXG4gIH0pO1xyXG4gIGFkZE1hcmtlcnNUb01hcCgpO1xyXG4gIGNvbnNvbGUubG9nKCdSZXN0YXVyYW50cyBIVE1MIGZpbGxlZCcpO1xyXG4gIGFjdGl2YXRlTGF6eUxvYWRpbmcoKTtcclxuICAvLyBzZXRUaW1lb3V0KCgpID0+IHN3aXRjaExvYWRlclRvTWFwKCksIDUwMDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiB0aGUgYXZlcmFnZSBub3RlIG9mIHRoZSByZXN0YXVyYW50LlxyXG4gKi9cclxuY29uc3QgZ2V0QXZlcmFnZU5vdGUgPSAocmV2aWV3cykgPT4ge1xyXG4gIGxldCBhdmVyYWdlTm90ZSA9IDA7XHJcbiAgcmV2aWV3cy5mb3JFYWNoKHJldmlldyA9PiB7XHJcbiAgICBhdmVyYWdlTm90ZSA9IGF2ZXJhZ2VOb3RlICsgTnVtYmVyKHJldmlldy5yYXRpbmcpO1xyXG4gIH0pO1xyXG4gIGF2ZXJhZ2VOb3RlID0gYXZlcmFnZU5vdGUgLyByZXZpZXdzLmxlbmd0aDtcclxuICByZXR1cm4gKE1hdGgucm91bmQoYXZlcmFnZU5vdGUgKiAxMCkpIC8gMTA7XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTC5cclxuICovXHJcbmNvbnN0IGNyZWF0ZVJlc3RhdXJhbnRIVE1MID0gKHJlc3RhdXJhbnQpID0+IHtcclxuICBcclxuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgY29uc3QgZmlndXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmlndXJlJyk7XHJcbiAgY29uc3QgZmlnY2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ZpZ2NhcHRpb24nKTtcclxuICBjb25zdCBwaWN0dXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGljdHVyZScpO1xyXG4gIGNvbnN0IHNvdXJjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xyXG4gIGNvbnN0IHNlY29uZFNvdXJjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xyXG4gIGNvbnN0IHRoU291cmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XHJcbiAgY29uc3Qgc291cmNlV2VicCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xyXG4gIGNvbnN0IHNlY29uZFNvdXJjZVdlYnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcclxuICBjb25zdCB0aFNvdXJjZVdlYnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcclxuICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gIGNvbnN0IGNvbnRhaW5lck5vdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhc2lkZScpO1xyXG4gIGNvbnN0IG5vdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcblxyXG4gIHNvdXJjZVdlYnAuZGF0YXNldC5zcmNzZXQgPSBgJHtEQkhlbHBlci5pbWFnZVdlYnBVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1sYXJnZV94MS53ZWJwIDF4LCAke0RCSGVscGVyLmltYWdlV2VicFVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCl9LWxhcmdlX3gyLndlYnAgMnhgO1xyXG4gIHNvdXJjZVdlYnAuc3Jjc2V0ID0gYCR7REJIZWxwZXIuaW1hZ2VXZWJwVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbGF6eS53ZWJwYDtcclxuICBzb3VyY2VXZWJwLm1lZGlhID0gJyhtaW4td2lkdGg6IDEwMDBweCknO1xyXG4gIHNvdXJjZVdlYnAuY2xhc3NOYW1lID0gJ2xhenknO1xyXG4gIHNvdXJjZVdlYnAudHlwZSA9ICdpbWFnZS93ZWJwJztcclxuICBzb3VyY2UuZGF0YXNldC5zcmNzZXQgPSBgJHtEQkhlbHBlci5pbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCl9LWxhcmdlX3gxLmpwZyAxeCwgJHtEQkhlbHBlci5pbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCl9LWxhcmdlX3gyLmpwZyAyeGA7XHJcbiAgc291cmNlLnNyY3NldCA9IGAke0RCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbGF6eS5qcGdgO1xyXG4gIHNvdXJjZS5tZWRpYSA9ICcobWluLXdpZHRoOiAxMDAwcHgpJztcclxuICBzb3VyY2UuY2xhc3NOYW1lID0gJ2xhenknO1xyXG4gIHNvdXJjZS50eXBlID0gJ2ltYWdlL2pwZWcnO1xyXG4gIFxyXG4gIHNlY29uZFNvdXJjZVdlYnAuZGF0YXNldC5zcmNzZXQgPSBgJHtEQkhlbHBlci5pbWFnZVdlYnBVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1tZWRpdW1feDEud2VicCAxeCwgJHtEQkhlbHBlci5pbWFnZVdlYnBVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1tZWRpdW1feDIud2VicCAyeGA7XHJcbiAgc2Vjb25kU291cmNlV2VicC5zcmNzZXQgPSBgJHtEQkhlbHBlci5pbWFnZVdlYnBVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1sYXp5LndlYnBgO1xyXG4gIHNlY29uZFNvdXJjZVdlYnAubWVkaWEgPSAnKG1pbi13aWR0aDogNDIwcHgpJztcclxuICBzZWNvbmRTb3VyY2VXZWJwLmNsYXNzTmFtZSA9ICdsYXp5JztcclxuICBzZWNvbmRTb3VyY2VXZWJwLnR5cGUgPSAnaW1hZ2Uvd2VicCc7XHJcbiAgc2Vjb25kU291cmNlLmRhdGFzZXQuc3Jjc2V0ID0gYCR7REJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1tZWRpdW1feDEuanBnIDF4LCAke0RCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbWVkaXVtX3gyLmpwZyAyeGA7XHJcbiAgc2Vjb25kU291cmNlLnNyY3NldCA9IGAke0RCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbGF6eS5qcGdgO1xyXG4gIHNlY29uZFNvdXJjZS5tZWRpYSA9ICcobWluLXdpZHRoOiA0MjBweCknO1xyXG4gIHNlY29uZFNvdXJjZS5jbGFzc05hbWUgPSAnbGF6eSc7XHJcbiAgc2Vjb25kU291cmNlLnR5cGUgPSAnaW1hZ2UvanBlZyc7XHJcbiAgXHJcbiAgdGhTb3VyY2VXZWJwLmRhdGFzZXQuc3Jjc2V0ID0gYCR7REJIZWxwZXIuaW1hZ2VXZWJwVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tc21hbGxfeDIud2VicCAyeCwgJHtEQkhlbHBlci5pbWFnZVdlYnBVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1zbWFsbF94MS53ZWJwIDF4YDtcclxuICB0aFNvdXJjZVdlYnAuc3Jjc2V0ID0gYCR7REJIZWxwZXIuaW1hZ2VXZWJwVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbGF6eS53ZWJwYDtcclxuICB0aFNvdXJjZVdlYnAubWVkaWEgPSAnKG1pbi13aWR0aDogMzIwcHgpJztcclxuICB0aFNvdXJjZVdlYnAuY2xhc3NOYW1lID0gJ2xhenknO1xyXG4gIHRoU291cmNlV2VicC50eXBlID0gJ2ltYWdlL3dlYnAnO1xyXG4gIHRoU291cmNlLmRhdGFzZXQuc3Jjc2V0ID0gYCR7REJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1zbWFsbF94Mi5qcGcgMngsICR7REJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1zbWFsbF94MS5qcGcgMXhgO1xyXG4gIHRoU291cmNlLnNyY3NldCA9IGAke0RCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KX0tbGF6eS5qcGdgO1xyXG4gIHRoU291cmNlLm1lZGlhID0gJyhtaW4td2lkdGg6IDMyMHB4KSc7XHJcbiAgdGhTb3VyY2UuY2xhc3NOYW1lID0gJ2xhenknO1xyXG4gIHRoU291cmNlLnR5cGUgPSAnaW1hZ2UvanBlZyc7XHJcbiAgXHJcbiAgaW1hZ2UuZGF0YXNldC5zcmMgPSBgJHtEQkhlbHBlci5pbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCl9LXNtYWxsX3gxLmpwZ2A7XHJcbiAgaW1hZ2Uuc3JjID0gYCR7REJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpfS1sYXp5LmpwZ2A7XHJcbiAgaW1hZ2UuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtaW1nIGxhenknO1xyXG4gIGltYWdlLnNldEF0dHJpYnV0ZSgnc2l6ZXMnLCAnKG1heC13aWR0aDogMTEwMHB4KSA4NXZ3LCAobWluLXdpZHRoOiAxMTAxcHgpIDk5MHB4Jyk7XHJcbiAgaW1hZ2UuYWx0ID0gYCR7cmVzdGF1cmFudC5uYW1lfSdzIHJlc3RhdXJhbnRgO1xyXG4gIGltYWdlLnR5cGUgPSAnaW1hZ2UvanBlZyc7XHJcbiAgXHJcbiAgbm90ZS5pbm5lckhUTUwgPSBgJHtnZXRBdmVyYWdlTm90ZShyZXN0YXVyYW50LnJldmlld3MpfS81YDtcclxuXHJcbiAgY29udGFpbmVyTm90ZS5hcHBlbmQobm90ZSk7XHJcblxyXG4gIHBpY3R1cmUuYXBwZW5kKHNvdXJjZVdlYnApO1xyXG4gIHBpY3R1cmUuYXBwZW5kKHNvdXJjZSk7XHJcbiAgcGljdHVyZS5hcHBlbmQoc2Vjb25kU291cmNlV2VicCk7XHJcbiAgcGljdHVyZS5hcHBlbmQoc2Vjb25kU291cmNlKTtcclxuICBwaWN0dXJlLmFwcGVuZCh0aFNvdXJjZVdlYnApO1xyXG4gIHBpY3R1cmUuYXBwZW5kKHRoU291cmNlKTtcclxuICBwaWN0dXJlLmFwcGVuZChpbWFnZSk7XHJcbiAgZmlndXJlLmFwcGVuZChwaWN0dXJlKTtcclxuICBmaWd1cmUuYXBwZW5kKGZpZ2NhcHRpb24pO1xyXG4gIFxyXG4gIGxpLmFwcGVuZChjb250YWluZXJOb3RlKTtcclxuICBsaS5hcHBlbmQoZmlndXJlKTtcclxuICBcclxuICBjb25zdCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICBuYW1lLmlubmVySFRNTCA9IHJlc3RhdXJhbnQubmFtZTtcclxuICBmaWdjYXB0aW9uLmFwcGVuZChuYW1lKTtcclxuXHJcbiAgY29uc3QgbmVpZ2hib3Job29kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gIG5laWdoYm9yaG9vZC5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5laWdoYm9yaG9vZDtcclxuICBsaS5hcHBlbmQobmVpZ2hib3Job29kKTtcclxuXHJcbiAgY29uc3QgYWRkcmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICBhZGRyZXNzLmlubmVySFRNTCA9IHJlc3RhdXJhbnQuYWRkcmVzcztcclxuICBsaS5hcHBlbmQoYWRkcmVzcyk7XHJcblxyXG4gIGNvbnN0IG1vcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgbW9yZS5pbm5lckhUTUwgPSAnVmlldyBEZXRhaWxzJztcclxuICBtb3JlLmhyZWYgPSBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpO1xyXG4gIG1vcmUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFZpZXcgZGV0YWlscyBvZiAke3Jlc3RhdXJhbnQubmFtZX1gKTtcclxuICBsaS5hcHBlbmQobW9yZSk7XHJcblxyXG4gIGxpLnNldEF0dHJpYnV0ZSgncm9sZScsICdsaXN0aXRlbScpO1xyXG4gIGxpLnNldEF0dHJpYnV0ZSgnYXJpYS1zZXRzaXplJywgJzEwJyk7XHJcbiAgbGkuc2V0QXR0cmlidXRlKCdhcmlhLXBvc2luc2V0JywgcmVzdGF1cmFudC5pZCk7XHJcbiAgcmV0dXJuIGxpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZCBtYXJrZXJzIGZvciBjdXJyZW50IHJlc3RhdXJhbnRzIHRvIHRoZSBtYXAuXHJcbiAqL1xyXG5jb25zdCBhZGRNYXJrZXJzVG9NYXAgPSAocmVzdGF1cmFudHMgPSBzZWxmLnJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgcmVzdGF1cmFudHMuZm9yRWFjaChyZXN0YXVyYW50ID0+IHtcclxuICAgIC8vIEFkZCBtYXJrZXIgdG8gdGhlIG1hcFxyXG4gICAgY29uc3QgbWFya2VyID0gREJIZWxwZXIubWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBzZWxmLm1hcCk7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsICgpID0+IHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBtYXJrZXIudXJsO1xyXG4gICAgfSk7XHJcbiAgICBzZWxmLm1hcmtlcnMucHVzaChtYXJrZXIpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgYWRkVG9Ib21lU2NyZWVuID0gKCkgPT4ge1xyXG4gIGNvbnN0IGFzaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXNpZGUnKTtcclxuICBjb25zdCBub3RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gIGNvbnN0IG1zZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuICBhc2lkZS5pZCA9ICdwb3AnO1xyXG4gIFxyXG4gIGFzaWRlLmNsYXNzTmFtZSA9ICdwb3B1cCc7XHJcbiAgbXNnLmNsYXNzTmFtZSA9ICdwb3B1cCBtc2cnO1xyXG4gIG1zZy5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzInKTtcclxuICBub3RlLmNsYXNzTmFtZSA9ICdwb3B1cCBub3RlJztcclxuICBub3RlLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMScpO1xyXG4gIHNwYW4uY2xhc3NOYW1lID0gJ2ljb25pY2ZpbGwtYXJyb3ctZG93bic7XHJcbiAgXHJcbiAgbm90ZS5pbm5lckhUTUwgPSAnKFRhcCB0byBjbG9zZSknO1xyXG4gIG1zZy5pbm5lckhUTUwgPSAnQWRkIDxpbWcgc3JjPVwiYXNzZXRzL2ltZy9zdmcvc2hhcmUtYXBwbGUuc3ZnXCIgYWx0PVwiXCI+IHRoaXMgYXBwIHRvIHlvdXIgaG9tZSBzY3JlZW4gYW5kIGVuam95IGl0IGFzIGEgcmVhbCBhcHBsaWNhdGlvbiAhJztcclxuICBcclxuICBhc2lkZS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XHJcbiAgYXNpZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBhc2lkZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDEnKS5mb2N1cygpO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGFzaWRlLnN0eWxlID0gJ2Rpc3BsYXk6IG5vbmU7JztcclxuICAgIH0sIDEwMDApO1xyXG4gIH0pO1xyXG4gIGFzaWRlLmFwcGVuZChub3RlKTsgXHJcbiAgYXNpZGUuYXBwZW5kKG1zZyk7XHJcbiAgYXNpZGUuYXBwZW5kKHNwYW4pO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluY29udGVudCcpLmFwcGVuZENoaWxkKGFzaWRlKTtcclxuICBhc2lkZS5mb2N1cygpO1xyXG4gIGFzaWRlLmZvY3VzKCk7XHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBhc2lkZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XHJcbiAgfSwgNzAwMCk7XHJcbn07XHJcbiJdfQ==
