// app.js

	// A geographic location ("school");
	var Location = function(name, lat, lng) {
		this.name = name;
		this.latlng = {lat, lng};
	};

	// Available geographic locations, including default
	var locations = [
			new Location("New York", 42.900956, -75.664966),
			new Location("Binghamton University", 42.088848, -75.969491),
			new Location("Stony Brook University", 40.912465, -73.123389),
			new Location("University at Albany", 42.686139, -73.823944),
			new Location("University at Buffalo", 43.000815, -78.788986)
	];

		// dropdown list of locations types (Google Maps API support Place Types)
		// https://developers.google.com/places/supported_types
	var placeTypes = [
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
		];

$(document).ready(function() {

	var viewModel = function() {
		var self = this;

		self.currentLocation = ko.observable();

		// the selected place Type
		self.placeType = ko.observable();

		// list of found places
		self.foundPlaces = ko.observableArray();

		// found places filter
		self.filter = ko.observable("");

		// Filter the list of found places and sort by name
		self.filteredPlaces = ko.computed(function() {
			var filter = self.filter().toLowerCase();
			var unsortedPlaces;
			if (!filter) {
				unsortedPlaces = self.foundPlaces();
			}
			else {
				unsortedPlaces = ko.utils.arrayFilter(self.foundPlaces(), function(place) {
				// 	return ko.utils.stringStartsWith(place.name.toLowerCase(), filter);
					return place.name.toLowerCase().indexOf(filter) !== -1;
				});
			}
			return unsortedPlaces.sort(function(place1, place2) {
				return place1.name == place2.name ? 0 : (place1.name < place2.name ? -1 : 1);
			});
		});

		// currently selected place (for infoWindow)
		self.selectedPlace = ko.observable();

		// Sort the Google reviews by date (new -> old)
		self.sortedGoogleReviews = ko.computed(function() {
			if(self.selectedPlace()) {
				return self.selectedPlace().reviews.sort(function(thisreview, nextreview) {
					return thisreview.time == nextreview.time ? 0 : (thisreview.time > nextreview.time ? -1 : 1);
				});
			}
		});

		self.fsVenue = ko.observable();

		// Sort the Foursquare tips by date (new -> old)
		self.fsSortedTips = ko.computed(function() {
			if(self.fsVenue()) {
				var tips = self.fsVenue().tips.groups[0].items;
				return tips.sort(function(thistip, nexttip) {
					return thistip.createdAt == nexttip.createdAt ? 0 : (thistip.createdAt > nexttip.createdAt ? -1 : 1);
				});
			}
		});

		// Status returned by Google Maps API
		self.searchStatus = ko.observable("");

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

