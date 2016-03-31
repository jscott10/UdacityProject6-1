// gmap.js

'use strict';

var map;
var placesService;
var markerList = [];
var currentMarker;
var infoWindow;
// var placeDetails;

var binghamton = {lat: 42.088848, lng: -75.969491};

var initMap = function() {

	// Activates knockout.js
	ko.applyBindings(viewModel);

	google.maps.visualRefresh = true;

	//Setting starting options of map
	var mapOptions = {
		center: binghamton,
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Getting map DOM element
	var mapElement = document.getElementById("map-div");

	//Creating a map with DOM element which is just obtained
	map = new google.maps.Map(mapElement, mapOptions);

	// Add traffic layer
	var trafficLayer = new google.maps.TrafficLayer();
	trafficLayer.setMap(map);

	// InfoWindow setup
	infoWindow = new google.maps.InfoWindow({
		content: document.getElementById("info-window")
	});

	placesService = new google.maps.places.PlacesService(map);

	initSystemState();

};

// Disable panel button and display error message if Google maps API is unavailable
var googleMapError = function() {
	$(".location-button").remove();
	$("#map-div").append("<div class='google-map-error'></div>");
	$(".google-map-error").append("<h2>Error loading Google Map</h2>");
	$(".google-map-error").append("<p>Please try again later</p>");
};

// Set up initial state
var initSystemState = function() {
	if(localStorage.getItem('placeType') !== null) {
		placeType(localStorage.getItem('placeType'));
		getPlaces();
	}

	$("#place-type").selectmenu("refresh");

	// get and display the weather information
	getYahooWeather();

};

// build the observable array (foundPlaces) of found places
var setPlacesList = function (results, status) {
	searchStatus(status); // ko.observable for Status Display
	if(foundPlaces().length > 0) {
		foundPlaces.removeAll();
	}
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		foundPlaces(results);
		addMarkers();
	}
};

// remove all markers and reset markerList
var resetMapMarkers = function() {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);
		markerList[i] = null;
	}
	markerList.length = 0;
};

/*
 * Add a map marker for each FILTERED place
 * filteredPlaces is a computed observable dependent upon foundPlaces
 */
var addMarkers = function() {
	for (var i = 0; i < filteredPlaces().length; i++) {
		addMarker(filteredPlaces()[i], i);
	}
};

var addMarker = function(place, index) {
	var marker = new google.maps.Marker( {
		place: {
			location: place.geometry.location,
			placeId: place.place_id
		},
		title: place.name,
		icon: {url: getMarkerIcon("inactive", index)},
		animation: google.maps.Animation.DROP,
		map: map
	});

	/*
	 * Need an addressable list of Markers (markerList) for resetMapMarkers()
	 * marker.index is used to reference the correct marker icon
	*/
	marker.index = markerList.push(marker) - 1;

	marker.addListener('click', function() {
		setCurrentMarker(marker);
	});
};

// Make a Marker the currentMarker and highlight
var setCurrentMarker = function(marker) {
	// reset the color of any current marker and stop any animations
	if(currentMarker) {
		currentMarker.setIcon({url: getMarkerIcon("inactive", currentMarker.index)});
		currentMarker.setAnimation(null);
	}
	currentMarker = marker;
	map.setCenter(currentMarker.getPosition());
	highlightMarker(currentMarker);
};

// Return the corresponding Marker for a placeID
var getCurrentMarker = function(placeId) {
	for(var index = 0; index < markerList.length; index++) {
		if(placeId === markerList[index].getPlace().placeId ) {
			return markerList[index];
		}
	}
};

// Change the Marker color to the active color
// Animate it (BOUNCE for 1.5 seconds)
// Open the infoWindow after animation completes
var highlightMarker = function(marker) {
	// Bring marker to front
	marker.setZIndex(google.maps.Marker.MAX_ZINDEX+1);
	// Use appropriate marker in selected highlight color
	marker.setIcon({url: getMarkerIcon("active", marker.index)});
	// Bounce the marker for 1.5 seconds
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function() {
		marker.setAnimation(null);
		openInfoWindow(marker);
	}, 1500);
};

// Open an infoWindow and set and display the contents based on the current marker
var openInfoWindow = function(marker) {
	// $("#info-window").empty();
	// $("#info-window").append("<p class='load-message'>Loading...</p>");
	// googlePlaceDetails("Loading");
	// placesService.getDetails({placeId: "dddd"}, function(placeDetails, status) {
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		// $("#info-window").empty();
		// if (status == google.maps.places.PlacesServiceStatus.OK) {
			googlePlaceDetails(placeDetails);
			// self.placeDetails = placeDetails; // Make placeDetails available to display functions
			// displayPlaceInfo();
		// }
		// else {
			// googlePlaceDetails(placeDetails);
			// googlePlaceDetails("Error");
			// $("#info-window").append("<h3 class='no-review-message'>Could not load location info.</h3>");
		// }
	});
	// infoWindow.open(map, marker);
};


/*
 *
 *	API calls for Foursquare and Yahoo! weather and display function for infoWindow
 *
 */

var displayPlaceInfo = function() {
	// displayPlaceBanner();
	// $("#info-window").append("<h2>Reviews</h2>");
	// displayGoogleReviews();
	getAndDisplayFoursquareReviews();
};

// var displayPlaceBanner = function() {
// 	$("#info-window").append("<div class='info-banner' class='clearfix'></div>");
// 	if(typeof placeDetails.photos !== 'undefined') {
// 		var imageUrl = placeDetails.photos[0].getUrl({maxWidth: 100});
// 		$(".info-banner").append("<img src='"+imageUrl+"' class='place-image'>");
// 	}
// 	$(".info-banner").append("<div class='banner-details'></div>");
// 	if(typeof placeDetails.name !== 'undefined') {
// 		$(".banner-details").append("<h1>"+placeDetails.name+"</h1>");
// 	}
// 	if(typeof placeDetails.formatted_address !== 'undefined') {
// 		$(".banner-details").append("<p>"+placeDetails.formatted_address+"</p>");
// 	}
// 	if (typeof placeDetails.formatted_phone_number !== 'undefined') {
// 		$(".banner-details").append("<p>"+placeDetails.formatted_phone_number+"</p>");
// 	}
// };

// var displayGoogleReviews = function() {
// 	var reviews = placeDetails.reviews;
// 	$("#info-window").append("<div class='google-reviews'></div>");
// 	$(".google-reviews").append("<h3>Google</h3>");
// 	if(typeof reviews !== 'undefined' && reviews.length > 0) {
// 		// Sort the Google reviews by date (new -> old)
// 		var sortedReviews = function() {
// 			return reviews.sort(function(thisreview, nextreview) {
// 				return thisreview.time == nextreview.time ? 0 : (thisreview.time > nextreview.time ? -1 : 1);
// 			});
// 		};
// 		$(".google-reviews").append("<ul></ul>");
// 		var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
// 		for(var i = 0; i < maxReviews; i++) {
// 			if(sortedReviews()[i].text) {
// 				var text = sortedReviews()[i].text;
// 				var time = sortedReviews()[i].time;
// 				$(".google-reviews > ul").append("<li>"+text+" ("+formattedDateTime(time)+")</li>");
// 			}
// 		}
// 	}
// 	else {
// 		$(".google-reviews").append("<p class='no-review-message'>No reviews found.</p>");
// 	}
// };

// fourSquare venue
var getAndDisplayFoursquareReviews = function() {
	$("#info-window").append("<div class='foursquare-reviews'></div>");
	$(".foursquare-reviews").append("<h3>FourSquare</h3>");
	$(".foursquare-reviews").append("<p class='load-message'>Loading...</p>");

	// API query data comes from Google placeDetails (ko.observable)
	var placeDetails = googlePlaceDetails();

	// API call to get the venue ID
	var url = "https://api.foursquare.com/v2/venues/search";
	var auth = {
		client_id: "LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE",
		client_secret: "QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ"
	};
	var data = {
		ll: placeDetails.geometry.location.lat()+", "+placeDetails.geometry.location.lng(),
		query: placeDetails.name,
		intent: "match",
		v: "20160101",
		m: "foursquare"
	};

	$.extend(data, auth);

	$.getJSON(url, data, function(result) {
		if(result.response.venues.length > 0) {
			var closestVenue = result.response.venues[0];

			// API call to get venue details
			var url = "https://api.foursquare.com/v2/venues/"+closestVenue.id;
			var venueData = {
				v: "20160101",
				m: "foursquare"
			};

			$.extend(venueData, auth);

			$.getJSON(url, venueData, function(result) {
				if(result.response.venue.tips.groups.length > 0) {
					var reviews = result.response.venue.tips.groups[0].items;
					displayFoursquareReviews(reviews);
				}
				else {
					$(".foursquare-reviews > p.load-message").remove();
					$(".foursquare-reviews").append("<p class='no-review-message'>No reviews found.</p>");
				}
			}).fail(function(textStatus, errorThrown) {
				$(".foursquare-reviews > p.load-message").remove();
				$(".foursquare-reviews").append("<p class='no-review-message'>Unable to retrieve Foursquare reviews.</p>");
			});
		}
		else {
			$(".foursquare-reviews > p.load-message").remove();
			$(".foursquare-reviews").append("<p class='no-review-message'>Foursquare venue not found.</p>");
		}
	}).fail(function() {
		$(".foursquare-reviews > p.load-message").remove();
		$(".foursquare-reviews").append("<p class='no-review-message'>Unable to retrieve Foursquare venue data.</p>");
	});
};

var displayFoursquareReviews = function(reviews) {
	$(".foursquare-reviews > p.load-message").remove();
	if(typeof reviews !== 'undefined' && reviews.length > 0) {
		// Sort the reviews by date (new -> old)
		var sortedReviews = function() {
			return reviews.sort(function(thisreview, nextreview) {
				return thisreview.createdAt == nextreview.createdAt ? 0 : (thisreview.createdAt > nextreview.createdAt ? -1 : 1);
			});
		};
		$(".foursquare-reviews").append("<ul></ul>");
		var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
		for(var i = 0; i < maxReviews; i++) {
			if(sortedReviews()[i].text) {
				var text = sortedReviews()[i].text;
				var time = sortedReviews()[i].createdAt;
				$(".foursquare-reviews > ul").append("<li>"+text+" ("+formattedDateTime(time)+")</li>");
			}
		}
	}
	else {
		$(".foursquare-reviews").append("<p class='no-review-message'>No reviews found.</p>");
	}
};

var getYahooWeather = function() {
	var url = "https://query.yahooapis.com/v1/public/yql";
	var data = {
		q: "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text = 'Binghamton NY')",
		format: "json",
		oauth_consumer_key: "dj0yJmk9aGlYN1JGdHc2S3RQJmQ9WVdrOVRWaHNaVXhZTmpJbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hMQ--",
		env: "store://datatables.org:alltableswithkeys"
	};

	var xx = $.getJSON(url, data, function(result) {
		console.log(xx);
		// If found, place the result in the ko.observable
		yahooWeatherResult(result);
	}).fail(function() {
		// If Yahoo weather info not available just remove the div
		$(".yahoo-weather").remove();
	});
};

// Return the appropriate Marker icon based on status ("active"/"inactive") and index
// Marker source: http://www.benjaminkeen.com/google-maps-coloured-markers/
var getMarkerIcon = function(status, index) {
	var iconLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var color;
	switch(status) {
		case "active":
			color = "green";
			break;
		case "inactive":
		default:
			color = "pink";
	}
	return "img/gm-markers/" + color + "_Marker" + iconLabel[index]+".png";
};

var formattedDateTime = function(UNIX_timestamp) {
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var time = date + ' ' + month + ' ' + year;
	return time;
};

