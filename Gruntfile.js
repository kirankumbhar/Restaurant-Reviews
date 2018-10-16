/*
 gruntfile to make smaller size images with small size
*/

module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            /* Change these */
            width: 400,
            suffix: '_small',
            quality: 50
          }]
        },

        /*
        You don't need to change this part if you don't change
        the directory structure.
        */
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'small_images/'
        }]
      }
    },

    // uglify js files
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'build/js/dbhelper.min.js':['js/dbhelper.js'],
          'build/js/idb.min.js':['js/idb.js'],
          'build/js/main.min.js':['js/main.js'],
          'build/js/restaurant_info.min.js':['js/restaurant_info.js']
        }
      }
    },

    //minify css files

    cssmin: {
      target: {
        files: {
          'build/css/styles.min.css':['css/styles.css']
        }
      }
    },
    // convert jpg/png to webp
    cwebp: {
      dynamic: {
        options: {
          q: 50
        },
        files: [{
          expand: true,
          cwd: 'img/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'build/img/'
        }]
      }
    },
    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['small_images/'],
      },
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['small_images/','build/','build/css','build/js']
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-cwebp');
  grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);
  grunt.registerTask('minify',['uglify']);
  grunt.registerTask('css',['cssmin']);
  grunt.registerTask('img_conv',['cwebp']);

};
