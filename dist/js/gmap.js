/*! p5 2016-03-31 */
"use strict";var map,placesService,markerList=[],currentMarker,infoWindow,binghamton={lat:42.088848,lng:-75.969491},initMap=function(){ko.applyBindings(viewModel),google.maps.visualRefresh=!0;var a={center:binghamton,zoom:14,mapTypeId:google.maps.MapTypeId.ROADMAP},b=document.getElementById("map-div");map=new google.maps.Map(b,a);var c=new google.maps.TrafficLayer;c.setMap(map),infoWindow=new google.maps.InfoWindow({content:document.getElementById("info-window")}),placesService=new google.maps.places.PlacesService(map),initSystemState()},googleMapError=function(){$(".location-button").remove(),$("#map-div").append("<div class='google-map-error'></div>"),$(".google-map-error").append("<h2>Error loading Google Map</h2>"),$(".google-map-error").append("<p>Please try again later</p>")},initSystemState=function(){null!==localStorage.getItem("placeType")&&(placeType(localStorage.getItem("placeType")),getPlaces()),$("#place-type").selectmenu("refresh"),getYahooWeather()},setPlacesList=function(a,b){searchStatus(b),foundPlaces().length>0&&foundPlaces.removeAll(),b==google.maps.places.PlacesServiceStatus.OK&&(foundPlaces(a),addMarkers())},resetMapMarkers=function(){for(var a=0;a<markerList.length;a++)markerList[a].setMap(null),markerList[a]=null;markerList.length=0},addMarkers=function(){for(var a=0;a<filteredPlaces().length;a++)addMarker(filteredPlaces()[a],a)},addMarker=function(a,b){var c=new google.maps.Marker({place:{location:a.geometry.location,placeId:a.place_id},title:a.name,icon:{url:getMarkerIcon("inactive",b)},animation:google.maps.Animation.DROP,map:map});c.index=markerList.push(c)-1,c.addListener("click",function(){setCurrentMarker(c)})},setCurrentMarker=function(a){currentMarker&&(currentMarker.setIcon({url:getMarkerIcon("inactive",currentMarker.index)}),currentMarker.setAnimation(null)),currentMarker=a,map.setCenter(currentMarker.getPosition()),highlightMarker(currentMarker)},getCurrentMarker=function(a){for(var b=0;b<markerList.length;b++)if(a===markerList[b].getPlace().placeId)return markerList[b]},highlightMarker=function(a){a.setZIndex(google.maps.Marker.MAX_ZINDEX+1),a.setIcon({url:getMarkerIcon("active",a.index)}),a.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){a.setAnimation(null),openInfoWindow(a)},1500)},openInfoWindow=function(a){placesService.getDetails({placeId:a.getPlace().placeId},function(a,b){googlePlaceDetails(a)})},getYahooWeather=function(){var a="https://query.yahooapis.com/v1/public/yql",b={q:"select * from weather.forecast where woeid in (select woeid from geo.places(1) where text = 'Binghamton NY')",format:"json",oauth_consumer_key:"dj0yJmk9aGlYN1JGdHc2S3RQJmQ9WVdrOVRWaHNaVXhZTmpJbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hMQ--",env:"store://datatables.org:alltableswithkeys"},c=$.getJSON(a,b,function(a){console.log(c),yahooWeatherResult(a)}).fail(function(){$(".yahoo-weather").remove()})},getMarkerIcon=function(a,b){var c,d="ABCDEFGHIJKLMNOPQRSTUVWXYZ";switch(a){case"active":c="green";break;case"inactive":default:c="pink"}return"img/gm-markers/"+c+"_Marker"+d[b]+".png"},formattedDateTime=function(a){var b=new Date(1e3*a),c=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],d=b.getFullYear(),e=c[b.getMonth()],f=b.getDate(),g=f+" "+e+" "+d;return g};