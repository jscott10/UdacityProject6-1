/*! p4 2016-02-02 */
var locations=[{name:"Binghamton University",latlng:{lat:42.088848,lng:-75.969491}},{name:"Stony Brook University",latlng:{lat:40.912465,lng:-73.123389}},{name:"University at Albany",latlng:{lat:42.686139,lng:-73.823944}},{name:"University at Buffalo",latlng:{lat:43.000815,lng:-78.788986}}];$(document).ready(function(){var a=function(){var a=this;a.placeTypes=ko.observableArray([{type:"airport",name:"Airports"},{type:"aquarium",name:"Aquariums"},{type:"art_gallery",name:"Art Galleries"},{type:"atm",name:"ATMs"},{type:"bakery",name:"Bakeries"},{type:"bank",name:"Banks"},{type:"bar",name:"Bars"},{type:"beauty_salon",name:"Beauty Salons"},{type:"book_store",name:"Book Stores"},{type:"bus_station",name:"Bus Stations"},{type:"cafe",name:"Cafes"},{type:"car_repair",name:"Car Repair"},{type:"convenience_store",name:"Convenience Stores"},{type:"department_store",name:"Department Stores"},{type:"food",name:"Food"},{type:"grocery_or_supermarket",name:"Supermarkets/Grocery Stores"},{type:"gym",name:"Gyms"},{type:"laundry",name:"Laundry/Dry Cleaning"},{type:"library",name:"Libraries"},{type:"liquor_store",name:"Liquor Stores"},{type:"lodging",name:"Hotels/Lodging"},{type:"meal_delivery",name:"Food (Delivery)"},{type:"meal_takeaway",name:"Food (Takeout)"},{type:"movie_theater",name:"Movie Theaters"},{type:"museum",name:"Museums"},{type:"night_club",name:"Night Clubs"},{type:"park",name:"Parks"},{type:"restaurant",name:"Restaurants"},{type:"shopping_mall",name:"Shopping Malls"},{type:"store",name:"Stores"},{type:"train_station",name:"Train Stations"},{type:"zoo",name:"Zoos"}]),a.placeType=ko.observable(),a.currentLocation=ko.observable(),a.currentLatLng=ko.computed(function(){for(var b=0;b<locations.length;b++)if(console.log(locations[b].name),console.log(a.currentLocation()),locations[b].name==a.currentLocation())return locations[b].latlng}),a.foundPlaces=ko.observableArray(),a.filter=ko.observable(""),a.selectedPlace=ko.observable(),a.searchStatus=ko.observable(""),a.fsVenue=ko.observable(),a.sortedTips=ko.computed(function(){if(a.fsVenue()){var b=a.fsVenue().tips.groups[0].items;return b.sort(function(a,b){return a.createdAt==b.createdAt?0:a.createdAt>b.createdAt?-1:1})}return[]}),a.filteredPlaces=ko.computed(function(){var b,c=a.filter().toLowerCase();return b=c?ko.utils.arrayFilter(a.foundPlaces(),function(a){return ko.utils.stringStartsWith(a.name.toLowerCase(),c)}):a.foundPlaces(),b.sort(function(a,b){return a.name==b.name?0:a.name<b.name?-1:1})}),a.statusText=ko.computed(function(){switch(a.searchStatus()){case"":return"Please select a location type from the list!";case google.maps.places.PlacesServiceStatus.OK:return"Found "+a.filteredPlaces().length+" Locations!";case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:return"No Locations found!";case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:return"Unknown Error. Please try again!";default:return"Unspecified Error!"}})};ko.applyBindings(a)});