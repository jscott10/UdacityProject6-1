// gmap.js

var map;
var placesService;
var iconLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var markerList = [];
var currentMarker;
var infoWindow;
var	$contentNode;

function initMap() {
	//Enabling new cartography and themes
	google.maps.visualRefresh = true;

	$contentNode = $('#info-window');

	initLatLng = locations[0].latlng;

	//Setting starting options of map
	var mapOptions = {
		center: initLatLng,
		zoom: 7,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Getting map DOM element
	var mapElement = $('#map-div').get(0);

	//Creating a map with DOM element which is just obtained
	map = new google.maps.Map(mapElement, mapOptions);

	// Add traffic layer
	// var trafficLayer = new google.maps.TrafficLayer();
	// trafficLayer.setMap(map);

	// InfoWindow setup
	infoWindow = new google.maps.InfoWindow({
		content: $contentNode[0]
	});

	// Replace the infoWindow node if the user closes the window
	google.maps.event.addListener(infoWindow, "closeclick", function () {
		replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
	});

	placesService = new google.maps.places.PlacesService(map);

};

var setNewLocation = function() {
	infoWindow.close();
	resetMapMarkers();
	resetMap();
	selectedPlace(undefined);
	placeType(undefined);
	searchStatus("");
	if(foundPlaces().length > 0) {
		foundPlaces.removeAll();
	}
}

var resetMap = function() {
	map.setCenter(currentLocation().latlng);
	map.setZoom(14);
};

var setMarkers = function() {
	resetMapMarkers();
	// Reset the filter
	filter("");
	// Get the array of places
	getPlaces();
};

var filterMarkers = function() {
	resetMapMarkers();
	addMarkers();
};

var resetMapMarkers = function() {
	clearMarkers();
	replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
};

// remove all markers and reset markerList
var clearMarkers = function() {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);
		markerList[i] = null;
	}
	markerList.length = 0;
};

// buildPlaceList is running asynchronously and doesn't finish before the markers are built!

var getPlaces = function() {
	var request = {
		location: currentLocation().latlng,
		radius: '2000',
		types: [placeType()]
	};
	placesService.nearbySearch(request, buildPlaceList);
};

// build the observable array (foundPlaces) of found places
var buildPlaceList = function (results, status) {
	searchStatus(status); // ko.observable for Status Display
	if(foundPlaces().length > 0) {
		foundPlaces.removeAll();
	}
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		foundPlaces(results);
		addMarkers();
	}
};

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
		icon: {url: 'img/src/gm-markers/pink_Marker'+iconLabel[index]+'.png'},
		// animation: google.maps.Animation.DROP,
		map: map
	});

	marker.addListener('click', function() {
		setCurrentMarker(marker);
	});

	// Need an addressable list of Markers
	marker.index = markerList.push(marker) - 1;
};

var setCurrentMarker = function(marker) {
	if(currentMarker) {
		infoWindow.close();
		replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
		currentMarker.setIcon({url: 'img/src/gm-markers/pink_Marker'+iconLabel[currentMarker.index]+'.png'});
		currentMarker.setAnimation(null);
	}
	currentMarker = marker;
	highlightMarker(currentMarker, "green");
};

var highlightMarker = function(marker, color) {
	// Bring marker to front
	marker.setZIndex(google.maps.Marker.MAX_ZINDEX+1);
	// Use appropriate marker in selected highlight color
	marker.setIcon({url: 'img/src/gm-markers/'+color+'_Marker'+iconLabel[marker.index]+'.png'});
	// Bounce the marker for 1.5 seconds
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function() {
		marker.setAnimation(null);
		openInfoWindow(marker);
	}, 1500);
};

var openInfoWindow = function(marker) {
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			selectedPlace(placeDetails);
			getFoursquareVenue();
			// getYelpData();
			infoWindow.open(map, marker);
		}
	});
};

var triggerInfoWindow = function(place_id) {
	if(markerList.length >= filteredPlaces().length) {
		setCurrentMarker(getCurrentMarker(place_id));
	}
};

var getCurrentMarker = function(placeId) {
	for(var index = 0; index < markerList.length; index++) {
		if(placeId === markerList[index].getPlace().placeId ) {
			return markerList[index];
		}
	}
};

// fourSquare venue
var getFoursquareVenue = function() {
	// if(selectedPlace() !== undefined) {
		var url = "https://api.foursquare.com/v2/venues/search";
		var auth = {
			client_id: "LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE",
			client_secret: "QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ"
		};
		var data = {
			ll: selectedPlace().geometry.location.lat()+", "+selectedPlace().geometry.location.lng(),
			query: selectedPlace().name,
			intent: "match",
			v: "20160101",
			m: "foursquare"
		};

		$.extend(data, auth);

		$.getJSON(url, data, function(result) {
			if(result.response.venues.length > 0) {
				var closestVenue = result.response.venues[0];
				var url = "https://api.foursquare.com/v2/venues/"+closestVenue.id;
				var venueData = {
					v: "20160101",
					m: "foursquare"
				};

				$.extend(venueData, auth);

				$.getJSON(url, venueData, function(result) {
					console.log(result);
					fsVenue(result.response.venue);
				}).error(function() {
					console.log("error1");
				fsVenue(undefined);
				});
			}
			else {
				fsVenue(undefined);
			}
		}).error(function() {
			console.log("error2");
			// console.log(r0);
			console.log(data);
			console.log("Status: "+r0.status+" ("+r0.statusText+")");
			return false;
		});
	// }
};

var getYahooWeather = function() {
// Yahoo!
// =======================================================================================

// https://query.yahooapis.com/v1/public/yql?q=
// select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22nome%2C%20ak%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys


	var yahooEndpoint = "https://query.yahooapis.com/v1/public/yql?q=";

	// yql = "select * from weather.forecast where woeid=2502265&format=json&diagnostics=true&callback=";
	var yql = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text = 'Binghamton NY)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"

	var yahoo_query = yahoo+encodeURI(yql);

	var yahoo_query2 = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D2502265&format=json&diagnostics=true&callback=";

	console.log("good: "+yahoo_query);
	console.log("bad:  "+yahoo_query2);

	$.getJSON(yahoo_query, function(data) {
		console.log(data);
		console.log(yahoo_query2);
	}).error(function() {
		console.log(yahoo_query2);
		console.log(data);
		console.log("FAIL!");
		});

};

var getYelpData = function() {

	var yelpEndpoint = "https://api.yelp.com/v2/search/?";

	var yelp_qry = "ll=42.0964782196554,-75.9702992976657,0.00&limit=1&callback=?";

	var y3 = "https://api.yelp.com/v2/search/?term=food&ll=37.788022,-122.399797";

	var yelp_query = yelpEndpoint+encodeURI(yelp_qry);
	var yelp_query2 = yelpEndpoint+yelp_qry;

	console.log("good: "+yelp_query);

	var r0 = $.getJSON(y3, function(data) {
		console.log(r0);
		console.log(data);
		console.log(yelp_query2);
	}).error(function() {
		console.log(r0);
		console.log(yelp_query);
		console.log("FAIL!");
		});
};

var formattedDateTime = function(UNIX_timestamp) {
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var ampm = hour < 12 ? "am" : "pm";
	hour = hour % 12;
	hour = hour ? hour : 12; // the hour '0' should be '12'
	min = min < 10 ? '0'+min : min;
	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ' ' + ampm;
	return time;
};

// Add the infoWindow node back to the body if it's been removed.
// Google maps deletes the infoWindow content node when the window is closed, knockout bindings stop working!
// http://stackoverflow.com/questions/15317796/knockout-loses-bindings-when-google-maps-api-v3-info-window-is-closed
var replaceDeletedInfoWindowNode = function() {
	// if( !$contentNode.length ) {
		$("body").append($contentNode);
	// }
};

