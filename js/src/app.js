// app.js

	var locations = [
			{name: "Binghamton University", latlng: {lat: 42.088848, lng: -75.969491}},
			{name: "Stony Brook University", latlng: {lat: 40.912465, lng: -73.123389}},
			{name: "University at Albany", latlng: {lat: 42.686139, lng: -73.823944}},
			{name: "University at Buffalo", latlng: {lat: 43.000815, lng: -78.788986}}
	];

$(document).ready(function() {

	var viewModel = function() {
		var self = this;

		// dropdown list of locations types (Google Maps API support Place Types)
		// https://developers.google.com/places/supported_types
		self.placeTypes = ko.observableArray([
			{type: "airport", name: "Airports"},
			{type: "aquarium", name: "Aquariums"},
			{type: "art_gallery", name: "Art Galleries"},
			{type: "atm", name: "ATMs"},
			{type: "bakery", name: "Bakeries"},
			{type: "bank", name: "Banks"},
			{type: "bar", name: "Bars"},
			{type: "beauty_salon", name: "Beauty Salons"},
			{type: "book_store", name: "Book Stores"},
			{type: "bus_station", name: "Bus Stations"},
			{type: "cafe", name: "Cafes"},
			{type: "car_repair", name: "Car Repair"},
			{type: "convenience_store", name: "Convenience Stores"},
			{type: "department_store", name: "Department Stores"},
			{type: "food", name: "Food"},
			{type: "grocery_or_supermarket", name: "Supermarkets/Grocery Stores"},
			{type: "gym", name: "Gyms"},
			{type: "laundry", name: "Laundry/Dry Cleaning"},
			{type: "library", name: "Libraries"},
			{type: "liquor_store", name: "Liquor Stores"},
			{type: "lodging", name: "Hotels/Lodging"},
			{type: "meal_delivery", name: "Food (Delivery)"},
			{type: "meal_takeaway", name: "Food (Takeout)"},
			{type: "movie_theater", name: "Movie Theaters"},
			{type: "museum", name: "Museums"},
			{type: "night_club", name: "Night Clubs"},
			{type: "park", name: "Parks"},
			{type: "restaurant", name: "Restaurants"},
			{type: "shopping_mall", name: "Shopping Malls"},
			{type: "store", name: "Stores"},
			{type: "train_station", name: "Train Stations"},
			{type: "zoo", name: "Zoos"}
		]);

		// the selected place Type
		self.placeType = ko.observable();

		// Return a formatted string to display
		// self.formattedPlaceName = ko.computed(function() {
		// 	for(var i=0; i<self.placeTypes().length; i++) {
		// 		if(self.placeTypes()[i].type === self.placeType()) {
		// 			return self.placeTypes()[i].name;
		// 		}
		// 	}
		// });

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

		// Filter the list of found places and sort by name
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

		// Result messages from Google placesSearch
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

