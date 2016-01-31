// app.js

// Class to represent a place on the map

// var locationNames = [
// 	"Binghamton University",
// 	"Stony Brook University",
// 	"University at Albany",
// 	"University at Buffalo"
// ];

var locations = [
		{name: "Binghamton University", latlng: {lat: 42.088848, lng: -75.969491}},
		{name: "Stony Brook University", latlng: {lat: 40.912465, lng: -73.123389}},
		{name: "University at Albany", latlng: {lat: 42.686139, lng: -73.823944}},
		{name: "University at Buffalo", latlng: {lat: 43.000815, lng: -78.788986}}
];

// var locationNames = function(locations) {
// 	var nameArray = [];
// 	for(var i = 0; i<locations.length; i++) {
// 		nameArray.push(locations[i].name);
// 	}
// }


$(document).ready(function() {

	var viewModel = function() {
		var self = this;

		// dropdown list of locations types (Google Maps API support Place Types)
		// https://developers.google.com/places/supported_types
		self.placeTypes = ko.observableArray([
			// {type: "accounting", name: "Accounting"},
			{type: "airport", name: "Airports"},
			// {type: "amusement_park", name: "Amusement Parks"},
			// {type: "aquarium", name: "Aquariums"},
			{type: "art_gallery", name: "Art Galleries"},
			{type: "atm", name: "ATMs"},
			{type: "bakery", name: "Bakeries"},
			{type: "bank", name: "Banks"},
			{type: "bar", name: "Bars"},
			{type: "beauty_salon", name: "Beauty Salons"},
			// {type: "bicycle_store", name: "Bicycle Stores"},
			{type: "book_store", name: "Book Stores"},
			// {type: "bowling_alley", name: "Bowling Alleys"},
			{type: "bus_station", name: "Bus Stations"},
			{type: "food", name: "Food"},
			// {type: "roofing_contractor", name: "Roofing Contractors"},
			// {type: "rv_park", name: "RV Parks"},
			{type: "school", name: "Schools"},
			// {type: "shoe_store", name: "Shoe Stores"},
			{type: "shopping_mall", name: "Shopping Malls"},
			// {type: "spa", name: "Spas"},
			// {type: "stadium", name: "Stadiums"},
			// {type: "storage", name: "Storage"},
			// {type: "store", name: "Stores"},
			// {type: "subway_station", name: "Subway Stations"},
			// {type: "synagogue", name: "Synagogues"},
			// {type: "taxi_stand", name: "Taxi Stands"},
			// {type: "train_station", name: "Train Stations"},
			// {type: "travel_agency", name: "Travel Agencies"},
			{type: "university", name: "Universities"},
			{type: "veterinary_care", name: "Veterinarians"},
			{type: "zoo", name: "Zoo"}
		]);

		// the selected place Type
		self.placeType = ko.observable();

		// ko.utils.arrayFilter - filter the items using the filter text
		self.formattedPlaceName = ko.computed(function() {
			for(var i=0; i<self.placeTypes().length; i++) {
				if(self.placeTypes()[i].type === self.placeType()) {
					return self.placeTypes()[i].name;
				}
			}
		});

		self.currentLocation = ko.observable();

		self.currentLatLng = ko.computed(function() {
			for(var i = 0; i < locations.length; i++) {
				console.log(locations[i].name);
				console.log(self.currentLocation());
				if(locations[i].name == self.currentLocation()) {
					return locations[i].latlng;
				}
			}
		});

		// list of found places
		self.foundPlaces = ko.observableArray();

		// found places filter
		self.filter = ko.observable("");

		// currently selected place (for infoWindow)
		self.selectedPlace = ko.observable();

		// Status returned by Google Maps API
		self.searchStatus = ko.observable("");

		// fourSquare venue
		self.fsVenue = ko.observable();

		// Sort the Foursquare tips by date (new -> old)
		self.sortedTips = ko.computed(function() {
			if(self.fsVenue()) {
				var tips = self.fsVenue().tips.groups[0].items;
				return tips.sort(function(thistip, nexttip) {
					return thistip.createdAt == nexttip.createdAt ? 0 : (thistip.createdAt > nexttip.createdAt ? -1 : 1);
				});
			}
			else return [];
		});

		self.filteredPlaces = ko.computed(function() {
			var filter = self.filter().toLowerCase();
			var unsortedPlaces;
			if (!filter) {
				unsortedPlaces = self.foundPlaces();
			}
			else {
				unsortedPlaces = ko.utils.arrayFilter(self.foundPlaces(), function(place) {
					return ko.utils.stringStartsWith(place.name.toLowerCase(), filter);
				});
			}
			return unsortedPlaces.sort(function(place1, place2) {
				return place1.name == place2.name ? 0 : (place1.name < place2.name ? -1 : 1);
			});
		});

		self.statusText = ko.computed(function() {
			switch(self.searchStatus()) {
				case "":
					return "Please select a location type from the list!";
					break;
				case google.maps.places.PlacesServiceStatus.OK:
					return "Found "+self.filteredPlaces().length+" Locations!";
					break;
				case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
					return "No Locations found!";
					break;
				case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
					return "Unknown Error. Please try again!";
					break;
				default:
					return "Unspecified Error!";
			}
		});

	};

	// Activates knockout.js
	ko.applyBindings(viewModel);

});

