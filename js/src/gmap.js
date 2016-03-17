// gmap.js

var map;
var placesService;
var markerList = [];
var currentMarker;
var infoWindow;
var placeDetails;

var binghamton = {lat: 42.088848, lng: -75.969491};

var error1;
var error2;
var pd;

function initMap() {
	//Enabling new cartography and themes
	google.maps.visualRefresh = true;

	contentNode = document.getElementById("info-window");

	//Setting starting options of map
	var mapOptions = {
		center: binghamton,
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Getting map DOM element
	var mapElement = $('#map-div').get(0);

	//Creating a map with DOM element which is just obtained
	map = new google.maps.Map(mapElement, mapOptions);

	// Add traffic layer
	var trafficLayer = new google.maps.TrafficLayer();
	trafficLayer.setMap(map);

	// InfoWindow setup
	infoWindow = new google.maps.InfoWindow({
		content: contentNode
	});

	placesService = new google.maps.places.PlacesService(map);

	// get and display the weather information
	getAndDisplayYahooWeather();

	// Retrieve saved settings
	if(localStorage.getItem('placeType') !== null) {
		if(localStorage.getItem('locationFilter') !== null) {
			locationFilter(localStorage.getItem('locationFilter'));
		}
		placeType(localStorage.getItem('placeType'));
		$("#place-type").selectmenu("refresh");
		getPlaces();
	}

};

// Remove visible markers and add markers based on filtered list
var filterMarkers = function() {
	localStorage.setItem("locationFilter", locationFilter());
	resetMapMarkers();
	addMarkers();
};

// remove all markers and reset markerList
var resetMapMarkers = function() {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);
		markerList[i] = null;
	}
	markerList.length = 0;
};

// Remove visible markers, reset filter and get new list of Places
var getPlaces = function() {
	resetMapMarkers();
	resetFilter();
	// Get the array of places
	var request = {
		location: binghamton,
		radius: '2000',
		types: [placeType()]
	};
	localStorage.setItem("placeType", placeType());
	placesService.nearbySearch(request, setPlacesList);
};

var resetFilter = function() {
	locationFilter("");
	localStorage.setItem("locationFilter", locationFilter());
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

// Set the current marker when an item on the filtered list is clicked
var triggerInfoWindow = function(place_id) {
	if(markerList.length >= filteredPlaces().length) {
		setCurrentMarker(getCurrentMarker(place_id));
	}
};

// Make a Marker the currentMarker and highlight
var setCurrentMarker = function(marker) {
	$("#mypanel").panel("close");
	// reset the color of any current marker and stop any animations
	if(currentMarker) {
		currentMarker.setIcon({url: getMarkerIcon("inactive", currentMarker.index)});
		currentMarker.setAnimation(null);
	}
	currentMarker = marker;
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
	$("#info-window").empty();
	$("#info-window").append("<p class='load-message'>Loading...</p>");
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		$("#info-window").empty();
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			self.placeDetails = placeDetails;
			displayPlaceInfo();
		}
		else {
			$("#info-window").append("<h3 class='no-review-message'>Could not load location info.</h3>");
		}
	});
	infoWindow.open(map, marker);
};


// INFOWINDOW

var displayPlaceInfo = function() {
	displayPlaceBanner();
	$("#info-window").append("<h2>Reviews</h2>");
	displayGoogleReviews();
	getAndDisplayFoursquareReviews();
};

var displayPlaceBanner = function() {
	$("#info-window").append("<div class='info-banner' class='clearfix'></div>");
	if(typeof placeDetails.photos !== 'undefined') {
		var imageUrl = placeDetails.photos[0].getUrl({maxWidth: 100});
		$(".info-banner").append("<img src='"+imageUrl+"' class='place-image'>");
	}
	if(typeof placeDetails.name !== 'undefined') {
		$(".info-banner").append("<h1>"+placeDetails.name+"</h1>");
	}
	if(typeof placeDetails.formatted_address !== 'undefined') {
		$(".info-banner").append("<p>"+placeDetails.formatted_address+"</p>");
	}
	if (typeof placeDetails.formatted_phone_number !== 'undefined') {
		$(".info-banner").append("<p>"+placeDetails.formatted_phone_number+"</p>");
	}
};

var displayGoogleReviews = function() {

	var reviews = placeDetails.reviews;

	$("#info-window").append("<div class='google-reviews'></div>");
	$(".google-reviews").append("<h3>Google</h3>");
	if(typeof reviews !== 'undefined' && reviews.length > 0) {
		// Sort the Google reviews by date (new -> old)
		var sortedReviews = function() {
			return reviews.sort(function(thisreview, nextreview) {
				return thisreview.time == nextreview.time ? 0 : (thisreview.time > nextreview.time ? -1 : 1);
			});
		}
		$(".google-reviews").append("<ul></ul>");
		var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
		for(var i = 0; i < maxReviews; i++) {
			if(sortedReviews()[i].text) {
				var text = sortedReviews()[i].text;
				var time = sortedReviews()[i].time;
				$(".google-reviews > ul").append("<li>"+text+" ("+formattedDateTime(time)+")</li>");
			}
		}
	}
	else {
		$(".google-reviews").append("<p class='no-review-message'>No reviews found.</p>");
	}
};

// fourSquare venue
var getAndDisplayFoursquareReviews = function() {
	$("#info-window").append("<div class='foursquare-reviews'></div>");
	$(".foursquare-reviews").append("<h3>FourSquare</h3>");
	$(".foursquare-reviews").append("<p class='load-message'>Loading...</p>");

	// API call to get the venue ID
	var url = "https://api.foursquare.com/v2/venues/search";
	var auth = {
		client_id: "LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE",
		client_secret: "QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ"
	};
	var data = {
		ll: this.placeDetails.geometry.location.lat()+", "+this.placeDetails.geometry.location.lng(),
		query: this.placeDetails.name,
		intent: "match",
		v: "20160101",
		m: "foursquare"
	};

	$.extend(data, auth);

	var jqXHR = $.getJSON(url, data, function(result) {
		if(result.response.venues.length > 0) {
			var closestVenue = result.response.venues[0];

			// API call to get venue details
			var url = "https://api.foursquare.com/v2/venues/"+closestVenue.id;
			var venueData = {
				v: "20160101",
				m: "foursquare"
			};

			$.extend(venueData, auth);

			var jqXHR = $.getJSON(url, venueData, function(result) {
				error2 = jqXHR;
				if(result.response.venue.tips.groups.length > 0) {
					var reviews = result.response.venue.tips.groups[0].items;
					displayFoursquareReviews(reviews);
				}
				else {
					$(".foursquare-reviews > p.load-message").remove();
					$(".foursquare-reviews").append("<p class='no-review-message'>No reviews found.</p>");
				}
			}).error(function(textStatus, errorThrown) {
				$(".foursquare-reviews > p.load-message").remove();
				$(".foursquare-reviews").append("<p class='no-review-message'>Unable to retrieve fourSquare reviews.</p>");
			});
		}
		else {
			$(".foursquare-reviews > p.load-message").remove();
			$(".foursquare-reviews").append("<p class='no-review-message'>fourSquare venue not found.</p>");
		}
	}).error(function() {
		$(".foursquare-reviews > p.load-message").remove();
		$(".foursquare-reviews").append("<p class='no-review-message'>Unable to retrieve fourSquare venue data.</p>");
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
		}
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

var getAndDisplayYahooWeather = function() {
	var url = "https://query.yahooapis.com/v1/public/yql";
	var data = {
		q: "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text = 'Binghamton NY')",
		format: "json",
		env: "store://datatables.org:alltableswithkeys"
	}

	$.getJSON(url, data, function(result) {
		displayYahooWeather(result);
	}).error(function() {
		// If Yahoo weather info not available just remove the div
		$("#yahoo-weather").remove();
	});
};

var displayYahooWeather = function(result) {
	var channel = result.query.results.channel;
	var description = channel.description;
	var condition = channel.item.condition;
	var image = "<img src='http://l.yimg.com/a/i/us/we/52/"+condition.code+".gif'>";
	var date = condition.date;
	var units = channel.units;
	var currentConditions = condition.text + ", " + condition.temp + " " + units.temperature;
	$(".weather-banner").append("<strong>"+description + "</strong><br>");
	$(".weather-banner").append(date);
	$(".current-conditions").append(image);
	$(".current-conditions").append("<span class='banner'>Current Conditions</span><br>");
	$(".current-conditions").append("<span class='text'>"+currentConditions+"</span>");
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
			break;
	}
	return "img/src/gm-markers/" + color + "_Marker" + iconLabel[index]+".png";
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
