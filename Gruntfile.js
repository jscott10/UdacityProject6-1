module.exports = function(grunt) {

var mozjpeg = require('imagemin-mozjpeg');

// Project configuration.
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	imagemin: {                          // Task
		// static: {                          // Target
		// 	options: {                       // Target options
		// 		optimizationLevel: 3,
		// 		svgoPlugins: [{ removeViewBox: false }],
		// 		use: [mozjpeg()]
		// 	},
		// 	files: {                         // Dictionary of files
		// 		'dist/img.png': 'src/img.png', // 'destination': 'source'
		// 		'dist/img.jpg': 'src/img.jpg',
		// 		'dist/img.gif': 'src/img.gif'
		// 	}
		// },
		dynamic: {                         // Another target
			files: [{
				expand: true,                  // Enable dynamic expansion
				cwd: 'img/src/',                   // Src matches are relative to this path
				src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
				dest: 'img/build/'                  // Destination path prefix
			}]
		}
	},
  	uglify: {
		options: {
			banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		},
		my_target: {
			files: [{
				expand: true,
				cwd: 'js/src',
				src: '**/*.js',
				dest: 'js/build'
			}]
		}
	},
	cssmin: {
		target: {
			files: [{
				expand: true,
				cwd: 'css/src',
				src: ['*.css', '!*.min.css'],
				dest: 'css/build',
				ext: '.min.css'
			}]
		}
	},
	htmlmin: {                                     // Task
		dist: {                                      // Target
			options: {                                 // Target options
				removeComments: true,
				collapseWhitespace: true
			},
			files: {                                   // Dictionary of files
				'index.html': 'html-source/index.html',     // 'destination': 'source'
				// 'dist/contact.html': 'src/contact.html'
			}
		}
		// dev: {                                       // Another target
		// 	files: {
		// 		'dist/index.html': 'src/index.html',
		// 		'dist/contact.html': 'src/contact.html'
		// 	}
		// }
	},
  	pagespeed: {
		options: {
			nokey: true,
			url: "http://26280c63.ngrok.io"
		},
		prod_mob: {
			options: {
				url: "http://26280c63.ngrok.io/frontend-nanodegree-mobile-portfolio/",
				locale: "en_GB",
				strategy: "mobile",
				threshold: 50
			}
		},
		prod_desk: {
			options: {
				url: "http://26280c63.ngrok.io/frontend-nanodegree-mobile-portfolio/",
				locale: "en_GB",
				strategy: "desktop",
				threshold: 50
			}
		}
		// paths: {
		// 	options: {
		// 		paths: ["/frontend-nanodegree-mobile-portfolio"],
		// 		locale: "en_GB",
		// 		strategy: "desktop",
		// 		threshold: 80
		// 	}
		// }
	}
});

// Load the plugin that provides the "uglify" task.
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-pagespeed');

// Default task(s).
grunt.registerTask('default', ['uglify', 'imagemin', 'cssmin', 'htmlmin', 'pagespeed']);

};