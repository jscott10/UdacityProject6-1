// gmap.js

var map;
var placesService;
var markerList = [];
var currentMarker;
var infoWindow;
var	$contentNode;

var binghamton = {lat: 42.088848, lng: -75.969491};

var error1;
var error2;
var pd;

function initMap() {
	//Enabling new cartography and themes
	google.maps.visualRefresh = true;

	$contentNode = $('#info-window');

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
	// var trafficLayer = new google.maps.TrafficLayer();
	// trafficLayer.setMap(map);

	// InfoWindow setup
	infoWindow = new google.maps.InfoWindow({
		content: $contentNode[0]
	});

	placesService = new google.maps.places.PlacesService(map);

};

var setMarkers = function() {
	resetMapMarkers();
	// Reset the filter
	filter("");
	// Get the array of places
	getPlaces();
};

// remove all markers and reset markerList
var resetMapMarkers = function() {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);
		markerList[i] = null;
	}
	markerList.length = 0;
};

var filterMarkers = function() {
	resetMapMarkers();
	addMarkers();
};

// buildPlaceList is running asynchronously and doesn't finish before the markers are built!

var getPlaces = function() {
	resetMapMarkers();
	// Reset the filter
	filter("");
	// Get the array of places
	var request = {
		location: binghamton,
		radius: '2000',
		types: [placeType()]
	};
	placesService.nearbySearch(request, setPlacesList);
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

var setCurrentMarker = function(marker) {
	// reset the color of any current marker and stop any animations
	if(currentMarker) {
		currentMarker.setIcon({url: getMarkerIcon("inactive", currentMarker.index)});
		currentMarker.setAnimation(null);
	}
	currentMarker = marker;
	highlightMarker(currentMarker);
};

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

var openInfoWindow = function(marker) {
	$("#info-window").empty();
	$("#info-window").append("<h3 class='load-message'>Loading...</h3>");
	infoWindow.open(map, marker);
	placesService.getDetails({placeId: marker.getPlace().placeId}, function(placeDetails, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			$(".load-message").remove();
			pd = placeDetails;
			displayPlaceInfo.googleDetails = placeDetails;
			displayPlaceInfo.banner();
			displayPlaceInfo.reviews();
		}
		else {
			$("#info-window").append("<h3 class='no-review-message'>Could not load location info.</h3>");
		}
	});
};



// INFOWINDOW

var displayPlaceInfo = {

	googleDetails: null,

	banner: function() {
		$("#info-window").append("<div id='info-banner' class='clearfix'></div>");
		if(typeof this.googleDetails.photos != 'undefined') {
			console.log(this.googleDetails.photos);
			var imageUrl = this.googleDetails.photos[0].getUrl({maxWidth: 100});
			$("#info-banner").append("<img src='"+imageUrl+"' class='image'>");
		}
		if(typeof this.googleDetails.name !== 'undefined') {
			$("#info-banner").append("<h1>"+this.googleDetails.name+"</h1>");
		}
		if(typeof this.googleDetails.formatted_address !== 'undefined') {
			$("#info-banner").append("<p>"+this.googleDetails.formatted_address+"</p>");
		}
		if (typeof this.googleDetails.formatted_phone_number !== 'undefined') {
			$("#info-banner").append("<p>"+this.googleDetails.formatted_phone_number+"</p>");
		}
	},

	reviews: function() {
		$("#info-window").append("<h2>Reviews</h2>");
		this.googleReviews();
		this.foursquareReviews();
	},

	googleReviews: function() {
		var reviews = this.googleDetails.reviews;
		$("#info-window").append("<h3>Google</h3>");
		if(typeof reviews !== 'undefined' && reviews.length > 0) {
			$("#info-window").append("<div class='google-reviews'><ul></ul></div>");
			// Sort the Google reviews by date (new -> old)
			var sortedReviews = function() {
				return reviews.sort(function(thisreview, nextreview) {
					return thisreview.time == nextreview.time ? 0 : (thisreview.time > nextreview.time ? -1 : 1);
				});
			}
			var maxReviews = reviews.length < 4 ? reviews.length : 4;
			for(var i = 0; i < maxReviews; i++) {
				if(reviews[i].text) {
					var text = reviews[i].text;
					if(reviews[i].time) {
						var time = reviews[i].time;
					}
					$(".google-reviews > ul").append("<li>"+text+" ("+formattedDateTime(time)+")</li>");
				}
			}
		}
		else {
			$("#info-window").append("<h3 class='no-review-message'>No reviews found.</h3>");
		}
	},

// fourSquare venue
	foursquareReviews: function() {
		$("#info-window").append("<h3>FourSquare</h3>");
		$("#info-window").append("<div id='foursquare-reviews'></div>");
		$("#foursquare-reviews").append("<h3 class='load-message'>Loading...</h3>");

		var url = "https://api.foursquare.com/v2/venues/search";
		var auth = {
			client_id: "LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE",
			client_secret: "QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ"
		};
		var data = {
			ll: this.googleDetails.geometry.location.lat()+", "+this.googleDetails.geometry.location.lng(),
			query: this.googleDetails.name,
			intent: "match",
			v: "20160101",
			m: "foursquare"
		};

		$.extend(data, auth);

		var jqXHR = $.getJSON(url, data, function(result) {
			if(result.response.venues.length > 0) {
				var closestVenue = result.response.venues[0];
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
						self.displayPlaceInfo.displayFoursquareReviews(reviews);
					}
					else {
						$("#foursquare-reviews").empty();
						$("#foursquare-reviews").append("<h3 class='no-review-message'>No reviews found.</h3>");
					}
				}).error(function(textStatus, errorThrown) {
					console.log(textStatus);
					console.log(errorThrown);
					// fsVenue();
				});
			}
			else {
				$("#foursquare-reviews").empty();
				$("#foursquare-reviews").append("<h3 class='no-review-message'>No reviews found.</h3>");
			}
		}).error(function() {
			error1 = jqXHR;
			console.log("Status1: "+jqXHR.status+" ("+jqXHR.statusText+")");
			return false;
		});
	},

	displayFoursquareReviews: function(reviews) {
		console.log(reviews);
		$("#foursquare-reviews").empty();
		if(typeof reviews !== 'undefined' && reviews.length > 0) {
			$("#foursquare-reviews").append("<ul></ul>");
			// Sort the Google reviews by date (new -> old)
			var sortedReviews = function() {
				return reviews.sort(function(thisreview, nextreview) {
					return thisreview.createdAt == nextreview.createdAt ? 0 : (thisreview.createdAt > nextreview.createdAt ? -1 : 1);
				});
			}
			console.log(sortedReviews());
			var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
			for(var i = 0; i < maxReviews; i++) {
				if(sortedReviews()[i].text) {
					var text = sortedReviews()[i].text;
					if(sortedReviews()[i].createdAt) {
						var time = sortedReviews()[i].createdAt;
					}
					$("#foursquare-reviews > ul").append("<li>"+text+" ("+formattedDateTime(time)+")</li>");
				}
			}
		}
		else {
			$("#foursquare-reviews").append("<h3 class='no-review-message'>No reviews found.</h3>");
		}
	}
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

	var r0 = $.getJSON(yelp_query2, function(data) {
		console.log(r0);
		console.log(data);
		console.log(yelp_query2);
	}).error(function() {
		console.log(r0);
		console.log(yelp_query);
		console.log("FAIL!");
		});
};

var goodYelp = function() {
	console.log("IT WORKED!!!!!!!");
}

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
}

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
	// var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ' ' + ampm;
	var time = date + ' ' + month + ' ' + year;
	return time;
};
