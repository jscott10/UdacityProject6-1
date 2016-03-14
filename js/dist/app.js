/*! p5 2016-03-13 */
var placeTypes=[{type:"airport",name:"Airports"},{type:"aquarium",name:"Aquariums"},{type:"art_gallery",name:"Art Galleries"},{type:"atm",name:"ATMs"},{type:"bakery",name:"Bakeries"},{type:"bank",name:"Banks"},{type:"bar",name:"Bars"},{type:"beauty_salon",name:"Beauty Salons"},{type:"book_store",name:"Book Stores"},{type:"bus_station",name:"Bus Stations"},{type:"cafe",name:"Cafes"},{type:"car_repair",name:"Car Repair"},{type:"convenience_store",name:"Convenience Stores"},{type:"department_store",name:"Department Stores"},{type:"meal_delivery",name:"Food (Delivery)"},{type:"meal_takeaway",name:"Food (Takeout)"},{type:"gym",name:"Gyms"},{type:"lodging",name:"Hotels/Lodging"},{type:"laundry",name:"Laundry/Dry Cleaning"},{type:"library",name:"Libraries"},{type:"liquor_store",name:"Liquor Stores"},{type:"movie_theater",name:"Movie Theaters"},{type:"museum",name:"Museums"},{type:"night_club",name:"Night Clubs"},{type:"park",name:"Parks"},{type:"restaurant",name:"Restaurants"},{type:"shopping_mall",name:"Shopping Malls"},{type:"store",name:"Stores"},{type:"grocery_or_supermarket",name:"Supermarkets/Grocery Stores"},{type:"train_station",name:"Train Stations"},{type:"zoo",name:"Zoos"}];$(document).ready(function(){var a=function(){var a=this;a.foundPlaces=ko.observableArray(),a.placeType=ko.observable(),a.filter=ko.observable(""),a.filteredPlaces=ko.computed(function(){var b,c=a.filter().toLowerCase();return b=c?ko.utils.arrayFilter(a.foundPlaces(),function(a){return-1!==a.name.toLowerCase().indexOf(c)}):a.foundPlaces(),b.sort(function(a,b){return a.name==b.name?0:a.name<b.name?-1:1})}),a.searchStatus=ko.observable(""),a.statusText=ko.computed(function(){switch(a.searchStatus()){case"":return"Please select a location type from the list!";case google.maps.places.PlacesServiceStatus.OK:return"Found "+a.filteredPlaces().length+" Locations!";case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:return"No Locations found!";case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:return"Unknown Error. Please try again!";default:return"Unspecified Error!"}})};ko.applyBindings(a)});