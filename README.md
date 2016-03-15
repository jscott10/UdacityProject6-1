# fend-p5-nmp
#Udacity FEND Project 5 - Neighborhood Map Project

##Overview:

The project consists of a full window Google map centered on Binghamton University in New York, and a dropdown list of business/location types (Places). Selecting a location type from the list will present an ordered list of locations of the selected type and corresponding markers on the map. A text box is provided to allow the list to be filtered by substring.

Clicking on a location or its marker will:

* Change the marker color from pink to green.
* Bounce the icon for 1.5 seconds
* Open an info window containing the following information:

* From Google Place Details:
 * Name of location
 * Associated photo (if available)
 * Formatted Address
 * Formatted Phone number
 * Up to four Google reviews sorted newest to oldest
* From Foursquare:
 * Up to four Foursquare Tips, sorted newest to oldest.


To configure the Grunt environment:
* grunt.loadNpmTasks('grunt-contrib-watch');
* grunt.loadNpmTasks('grunt-contrib-imagemin');
* grunt.loadNpmTasks('grunt-contrib-uglify');
* grunt.loadNpmTasks('grunt-contrib-sass');
* grunt.loadNpmTasks('grunt-contrib-htmlmin');
* grunt.loadNpmTasks('grunt-pagespeed'); // not watched
