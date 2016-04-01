// viewModel.js

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
			case "no selection":
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

	// Set the current marker when an item on the filtered list is clicked
	self.triggerInfoWindow = function(place_id) {
		if(markerList.length >= self.filteredPlaces().length) {
			$("#mypanel").panel("close");
			setCurrentMarker(getCurrentMarker(place_id));
		}
	};

	// Remove visible markers, reset filter and get new list of Places
	self.getPlaces = function() {
		resetMapMarkers();
		self.locationFilter(); // Reset location filter
		// Get the array of places
		var request = {
			location: binghamton,
			radius: '2000',
			types: null
		};
		localStorage.setItem("placeType", self.placeType());
		placesService.nearbySearch(request, setPlacesList);
	};

	// Called when text is changed in filter text box
	// Remove visible markers and add markers based on filtered list
	self.filterMarkers = function() {
		resetMapMarkers();
		addMarkers();
	};

	// Holds the results of placesService.getDetails()
	// Updating triggers openWindow()
	self.googlePlaceDetails = ko.observable();

	// Force infoWindowContent to update even if googlePlaceDetails is updated with the same value
	// Ensures that the infoWindow moves to the correct marker even if getDetails() returns null
	self.googlePlaceDetails.extend({ notify: 'always' });

	// Open the infoWindow every time googlePlaceDetails changes
	self.googlePlaceDetails.subscribe(function(newValue) {
		infoWindow.open(map, currentMarker);
	});

	// Format the Google content (banner info and Google reviews)
	self.infoWindowGoogleContent = ko.computed(function() {
		if(self.googlePlaceDetails() !== undefined) {
			var placeDetails = self.googlePlaceDetails();
			var htmlBanner = "<div class='info-banner clearfix'>";
			if(placeDetails === null) {	// placesService.getDetails() failed
				htmlBanner += "<h3 class='no-review-message'>Could not load location info.</h3>";
			}
			else {	// Build the banner and Google review HTML from the returned placeDetails
				if(placeDetails.photos !== undefined) {
					var imageUrl = placeDetails.photos[0].getUrl({maxWidth: 100});
					htmlBanner += "<img src='"+imageUrl+"' class='place-image'>";
				}
				if(placeDetails.name !== undefined) {
					htmlBanner += "<h1>"+placeDetails.name+"</h1>";
				}
				if(placeDetails.formatted_address !== undefined) {
					htmlBanner += "<p>"+placeDetails.formatted_address;
				}
				if(placeDetails.formatted_phone_number !== undefined) {
					htmlBanner += "<br>"+placeDetails.formatted_phone_number+"</p>";
				}
				else {
					htmlBanner += "</p>";
				}
			}
			htmlBanner += "</div>";

			var reviews = placeDetails.reviews;
			var htmlReviews = "<div class='google-reviews'>";
			htmlReviews += "<h3>Google</h3>";
			if(reviews !== undefined && reviews.length > 0) {
				// Sort the Google reviews by date (new -> old)
				var sortedReviews = function() {
					return reviews.sort(function(thisreview, nextreview) {
						return thisreview.time == nextreview.time ? 0 : (thisreview.time > nextreview.time ? -1 : 1);
					});
				};
				htmlReviews += "<ul>";
				var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
				for(var i = 0; i < maxReviews; i++) {
					if(sortedReviews()[i].text) {
						var text = sortedReviews()[i].text;
						var time = sortedReviews()[i].time;
						htmlReviews += "<li>"+text+" ("+formattedDateTime(time)+")</li>";
					}
				}
			}
			else {
				htmlReviews += "<p class='no-review-message'>No reviews found.</p>";
			}

			htmlReviews += "</div>";

			return htmlBanner + htmlReviews;
		}
	});

	// Holds the formatted Foursquare review HTML
	self.foursquareReviewHTML = ko.observable();

	// Call the Foursquare API request and format the result
	self.infoWindowFoursquareReviews = ko.computed(function() {
		if(self.googlePlaceDetails() !== undefined) {
			var htmlReviews = "<h3>Foursquare</h3>";
			htmlReviews += "<p class='no-review-message'>Loading...</p></div>";
			self.foursquareReviewHTML(htmlReviews);

			// API call to get the venue ID
			var url = "https://api.foursquare.com/v2/venues/search";
			var auth = {
				client_id: "LKOCAAQC2EHG2YHBHPKMX2TAIHXEOXL3U2GQSCHN5542VYJE",
				client_secret: "QLLAGNKK2QOLH054PMAPYU1PUQQ4G3YNCOU52WBCH3HDKOQJ"
			};
			var data = {
				ll: self.googlePlaceDetails().geometry.location.lat()+", "+self.googlePlaceDetails().geometry.location.lng(),
				query: self.googlePlaceDetails().name,
				intent: "match",
				v: "20160101",
				m: "foursquare"
			};

			$.extend(data, auth);

			$.getJSON(url, data, function(result) {
				htmlReviews = "<h3>Foursquare</h3>";
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
							if(typeof reviews !== 'undefined' && reviews.length > 0) {
								// Sort the reviews by date (new -> old)
								var sortedReviews = function() {
									return reviews.sort(function(thisreview, nextreview) {
										return thisreview.createdAt == nextreview.createdAt ? 0 : (thisreview.createdAt > nextreview.createdAt ? -1 : 1);
									});
								};
								htmlReviews += "<ul>";
								var maxReviews = sortedReviews().length < 4 ? sortedReviews().length : 4;
								for(var i = 0; i < maxReviews; i++) {	// Success!
									if(sortedReviews()[i].text) {
										var text = sortedReviews()[i].text;
										var time = sortedReviews()[i].createdAt;
										htmlReviews += "<li>"+text+" ("+formattedDateTime(time)+")</li>";
									}
								}
								htmlReviews += "</ul></div>";
								self.foursquareReviewHTML(htmlReviews);
							}
							else {	// No reviews found
								htmlReviews += "<p class='no-review-message'>No reviews found.</p></div>";
								self.foursquareReviewHTML(htmlReviews);
							}
						}
						else {	// No groups found (so no reviews)
							htmlReviews += "<p class='no-review-message'>No reviews found.</p></div>";
							self.foursquareReviewHTML(htmlReviews);
						}
					}).fail(function() {	// Search for venue details failed
						htmlReviews += "<p class='no-review-message'>Unable to retrieve Foursquare reviews.</p></div>";
						self.foursquareReviewHTML(htmlReviews);
					});
				}
				else {	// Venue not found
					htmlReviews += "<p class='no-review-message'>Foursquare venue not found.</p></div>";
					self.foursquareReviewHTML(htmlReviews);
				}
			}).fail(function() {	// Venue search failed.
				htmlReviews += "<p class='no-review-message'>Unable to retrieve Foursquare venue data.</p></div>";
				self.foursquareReviewHTML(htmlReviews);
			});
		}
	});

	// Holds the results of the Yahoo! weather request
	self.yahooWeatherResult = ko.observable();

	// Formatted content
	self.yahooWeatherContent = ko.computed(function() {
		if(self.yahooWeatherResult() !== undefined) {
			if(self.yahooWeatherResult().query.results === null) {
				return "<div class='weather-banner-error'>Weather data not available</div>";
			}
			else {
				var channel = self.yahooWeatherResult().query.results.channel;
				var description = channel.description;
				var condition = channel.item.condition;
				var date = condition.date;
				var units = channel.units;
				var currentConditions = condition.text + ", " + condition.temp + " " + units.temperature;

				var htmlDescription = "<strong>"+description + "</strong><br>";
				var htmlImage = "<img src='http://l.yimg.com/a/i/us/we/52/"+condition.code+".gif'>";
				var htmlCurrentConditionsBanner = "<span class='banner'>Current Conditions</span><br>";
				var htmlCurrentConditions = "<span class='text'>"+currentConditions+"</span>";

				var htmlWeatherBannerDiv = "<div class='weather-banner'>" + htmlDescription + date + "</div>";
				var htmlCurrentConditionsDiv = "<div class='current-conditions'>" + htmlImage + htmlCurrentConditionsBanner + htmlCurrentConditions + "</div>";

				return htmlWeatherBannerDiv + htmlCurrentConditionsDiv;
			}
		}
	});
};


