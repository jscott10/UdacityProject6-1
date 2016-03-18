// viewModel.js

$(document).ready(function() {

	var viewModel = function() {

		var self = this;

		// Google Place Types and associated display text
		self.placeTypes = [
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
			{type: "meal_delivery", name: "Food (Delivery)"},
			{type: "meal_takeaway", name: "Food (Takeout)"},
			{type: "gym", name: "Gyms"},
			{type: "lodging", name: "Hotels/Lodging"},
			{type: "laundry", name: "Laundry/Dry Cleaning"},
			{type: "library", name: "Libraries"},
			{type: "liquor_store", name: "Liquor Stores"},
			{type: "movie_theater", name: "Movie Theaters"},
			{type: "museum", name: "Museums"},
			{type: "night_club", name: "Night Clubs"},
			{type: "park", name: "Parks"},
			{type: "restaurant", name: "Restaurants"},
			{type: "shopping_mall", name: "Shopping Malls"},
			{type: "store", name: "Stores"},
			{type: "grocery_or_supermarket", name: "Supermarkets/Grocery Stores"},
			{type: "train_station", name: "Train Stations"},
			{type: "zoo", name: "Zoos"}
		];

		// list of found places
		self.foundPlaces = ko.observableArray();

		// the selected place Type
		self.placeType = ko.observable();

		// found places filter
		self.locationFilter = ko.observable();

		// Filter the list of found places and sort by name
		// This is the list that is displayed in the Locations Panel
		self.filteredPlaces = ko.computed(function() {
			var unsortedPlaces;
			if(self.locationFilter() === undefined) {
				unsortedPlaces = self.foundPlaces();
			}
			else {
				var filter = self.locationFilter().toLowerCase();
				unsortedPlaces = ko.utils.arrayFilter(self.foundPlaces(), function(place) {
					return place.name.toLowerCase().indexOf(filter) !== -1;
				});
			}
			return unsortedPlaces.sort(function(place1, place2) {
				return place1.name == place2.name ? 0 : (place1.name < place2.name ? -1 : 1);
			});
		});

		// Status returned by Google Maps API
		self.searchStatus = ko.observable();

		// Result messages from Google placesSearch
		self.statusText = ko.computed(function() {
			switch(self.searchStatus()) {
				case undefined:
					return "Please select a location type from the list";
				case google.maps.places.PlacesServiceStatus.OK:
					var locationsText = self.filteredPlaces().length === 1 ? "Location" : "Locations";
					return "Found "+self.filteredPlaces().length+" "+locationsText;
				case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
					return "No Locations found";
				case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
					return "An error has occurred. Please try again.";
				default:
					return "Unspecified Error";
			}
		});

	};

	// Activates knockout.js
	ko.applyBindings(viewModel);

});

