/*! p4 2016-01-26 */
$(document).ready(function(){var a=function(){var a=this;a.placeTypes=ko.observableArray([{type:"accounting",name:"Accounting"},{type:"airport",name:"Airports"},{type:"amusement_park",name:"Amusement Parks"},{type:"aquarium",name:"Aquariums"},{type:"art_gallery",name:"Art Galleries"},{type:"atm",name:"ATMs"},{type:"bakery",name:"Bakeries"},{type:"bank",name:"Banks"},{type:"bar",name:"Bars"},{type:"beauty_salon",name:"Beauty Salons"},{type:"bicycle_store",name:"Bicycle Stores"},{type:"book_store",name:"Book Stores"},{type:"bowling_alley",name:"Bowling Alleys"},{type:"bus_station",name:"Bus Stations"},{type:"food",name:"Food"},{type:"roofing_contractor",name:"Roofing Contractors"},{type:"rv_park",name:"RV Parks"},{type:"school",name:"Schools"},{type:"shoe_store",name:"Shoe Stores"},{type:"shopping_mall",name:"Shopping Malls"},{type:"spa",name:"Spas"},{type:"stadium",name:"Stadiums"},{type:"storage",name:"Storage"},{type:"store",name:"Stores"},{type:"subway_station",name:"Subway Stations"},{type:"synagogue",name:"Synagogues"},{type:"taxi_stand",name:"Taxi Stands"},{type:"train_station",name:"Train Stations"},{type:"travel_agency",name:"Travel Agencies"},{type:"university",name:"Universities"},{type:"veterinary_care",name:"Veterinarians"},{type:"zoo",name:"Zoo"}]),a.placeType=ko.observable(),a.foundPlaces=ko.observableArray(),a.filter=ko.observable(""),a.selectedPlace=ko.observable(),a.searchStatus=ko.observable(""),a.fsVenue=ko.observable(),a.formattedPlaceName=ko.computed(function(){for(var b=0;b<a.placeTypes().length;b++)if(a.placeTypes()[b].type===a.placeType())return a.placeTypes()[b].name}),a.filteredPlaces=ko.computed(function(){var b,c=a.filter().toLowerCase();return b=c?ko.utils.arrayFilter(a.foundPlaces(),function(a){return ko.utils.stringStartsWith(a.name.toLowerCase(),c)}):a.foundPlaces(),b.sort(function(a,b){return a.name==b.name?0:a.name<b.name?-1:1})}),a.sortedTips=ko.computed(function(){if(a.fsVenue()){var b=a.fsVenue().tips.groups[0].items;return b.sort(function(a,b){return a.createdAt==b.createdAt?0:a.createdAt>b.createdAt?-1:1})}return[]}),a.statusText=ko.computed(function(){switch(a.searchStatus()){case"":return"Please select a location type from the list!";case google.maps.places.PlacesServiceStatus.OK:return"Found "+a.filteredPlaces().length+" Locations!";case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:return"No Locations found!";case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:return"Unknown Error. Please try again!";default:return"Unspecified Error!"}})};ko.applyBindings(a)});