//Defining map as a global variable to access from other functions

console.log("just before........");
var map;
var placesService;
var buLatLng;
var iconLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var markerList = [];
var currentMarker;
var infoWindow;
var $contentNode;

// console.log(locations);

// var currentLocation = locations["Binghamton University"];
// var currentLocation = locations["Stony Brook University"];

function initMap() {
	$contentNode = $('#info-window');
	//Enabling new cartography and themes
	google.maps.visualRefresh = true;

	console.log(currentLatLng());
	buLatLng = new google.maps.LatLng(currentLatLng().lat, currentLatLng().lng);

	//Setting starting options of map
	var mapOptions = {
		center: buLatLng,
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
		content: $contentNode[0]
	});

	google.maps.event.addListener(infoWindow, "closeclick", function () {
		replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
	});

	placesService = new google.maps.places.PlacesService(map);

};

var setMarkers = function() {
	// Delete any old Markers
	if(markerList.length > 0) {
		clearMarkers();
	}

	replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
	// Reset the filter
	filter("");
	// Get the array of places
	getPlaces();
};

var filterMarkers = function() {
	if(markerList.length > 0) {
		clearMarkers();
	}

	replaceDeletedInfoWindowNode(); // Maintain knockout bindings for infoWindow
	addMarkers();
};

// remove all markers in the list from map and delete
var clearMarkers = function() {
	for (var i = 0; i < markerList.length; i++) {
		clearMarker(markerList[i]);
	}
	markerList.length = 0;
};

// remove and delete a single marker from the map
var clearMarker = function(marker) {
	marker.setMap(null);
	marker = null;
}

// buildPlaceList is running asynchronously and doesn't finish before the markers are built!

var getPlaces = function() {
	var request = {
		location: buLatLng,
		radius: '2000',
		types: [placeType()]
	};
	placesService.nearbySearch(request, buildPlaceList);
}

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

// COMBINE THE ADDMARKERS FUNCTIONS!!!

// filteredPlaces is a ko.computed array, equals places if filter=""
// var addMarkers2 = function() {
// 	for (var i = 0; i < filteredPlaces().length; i++) {
// 		(function(i) {
// 			setTimeout(function() {
// 				createMarker(filteredPlaces()[i], i);
// 			}, 1000/i);
// 		})(i);
// 	}
// };

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
		// openInfoWindow(marker);
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
}

var highlightMarker = function(marker, color) {
	// var currentMarker = markerList[index];
	marker.setZIndex(google.maps.Marker.MAX_ZINDEX+1);
	marker.setIcon({url: 'img/src/gm-markers/'+color+'_Marker'+iconLabel[marker.index]+'.png'});
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function() {
		marker.setAnimation(null);
		openInfoWindow(marker);
	}, 2000);
};

// var createMarker = function(place, index) {
// 	var marker = new google.maps.Marker( {
// 		place: {
// 			location: place.geometry.location,
// 			placeId: place.place_id
// 		},
// 		title: place.name,
// 		icon: {url: 'img/src/gm-markers/pink_Marker'+iconLabel[index]+'.png'},
// 		// animation: google.maps.Animation.DROP,
// 		map: map
// 	});

// 	// Need an addressable list of Markers
// 	markerList.push(marker);

// 	marker.addListener('click', function() {
// 		openInfoWindow(marker);
// 	});
// };

var openInfoWindow = function(marker) {
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			selectedPlace(placeDetails);
			getFourSquareVenue(placeDetails.geometry.location, placeDetails.name);
			infoWindow.open(map, marker);
		}
	});
};

var triggerInfoWindow = function(place_id) {
	if(markerList.length >= filteredPlaces().length) {
		setCurrentMarker(getCurrentMarker(place_id, markerList));
	}
};

var getCurrentMarker = function(placeId, markerList) {
	for(var index = 0; index < markerList.length; index++) {
		if(placeId === markerList[index].getPlace().placeId ) {
			return markerList[index];
		}
	}
};

// var getMarkerIndex = function(placeId, markerList) {
// 	// console.log(placeId);
// 	// console.log(markerList);
// 	for(var index = 0; index < markerList.length; index++) {
// 		// console.log("i: "+index+"placeId: "+placeId+"markerpid: "+markerList[index].getPlace().placeId);
// 		if(placeId === markerList[index].getPlace().placeId ) {
// 			// console.log(markerList[i]);
// 			return index;
// 		}
// 	}
// };

var getFourSquareVenue = function(location, name) {

	var name = name;
	var location = location;

	var fsEntrypoint = "https://api.foursquare.com/v2/venues/";
	var fsLocation = "search?ll="+location.lat()+", "+location.lng();
	var fsName = "&query="+encodeURI(name);
	var fsIntent = "&intent=match";
	var fsAuth = "client_id=LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE&client_secret=QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ&v=20160108";

	var fsQuery = fsEntrypoint+fsLocation+fsName+fsIntent+"&"+fsAuth;

	var r0 = $.getJSON(fsQuery, function(data) {
		if(data.response.venues.length > 0) {
			var venueID = data.response.venues[0].id;
			var venueQuery = fsEntrypoint+venueID+"?"+fsAuth;
			var r1 = $.getJSON(venueQuery, function(data2) {
				fsVenue(data2.response.venue);
				// for(var i = 0; i < venue().tips.count; i++) {
				// 	$('#tips').append("<li>"+data2.response.venue.tips.groups[0].items[i].text+"</li>");
				// }
			}).error(function() {
				fsVenue(false);
			});
		}
		else {
			fsVenue(false);
		}
	}).error(function() {
		console.log("Status: "+t0.status+" ("+t0.statusText+")");
	});

	console.log("leavin the function");

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
}

// Add the infoWindow node back to the body
// Google maps deletes the infoWindow content node when the window is closed, knockout bindings stop working!
// http://stackoverflow.com/questions/15317796/knockout-loses-bindings-when-google-maps-api-v3-info-window-is-closed
var replaceDeletedInfoWindowNode = function() {
	$("body").append($contentNode);
};
