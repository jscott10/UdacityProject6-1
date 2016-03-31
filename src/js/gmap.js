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
	// placesService.getDetails({placeId: "dddd"}, function(placeDetails, status) {
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		googlePlaceDetails(placeDetails);
	});
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

