/*
 * grunt-triton
 * https://github.com/travispaul/grunt-triton
 *
 * Copyright (c) 2016 Travis Paul
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration examples:
    triton: {

      // create a 128MB nginx instance and serve HTML5 boilerplate
      nginx: {
        options: {
          machine: {
            name: 'grunt-nginx-128',
            tags: {
              role: 'www'
            },
            'metadata.user-script': grunt.file.read('user-script/nginx-user-script.sh'),
          },
          image: {
            name: 'nginx'
          },
          package: {
            memory: 128
          }
        }
      },

      // create a 512MB couchdb instance
      couchdb: {
        options: {
          machine: {
            name: 'grunt-couchdb-512',
            tags: {
              role: 'api'
            },
            'metadata.couchdb_password': 'get from .couchrc perhaps?',
            'metadata.couchdb_bind_address': '0.0.0.0',
            'metadata.user-script': grunt.file.read('user-script/couchdb-user-script.sh'),
          },
          package: {
            memory: 512
          }
        }
      },

      // create a nodejs instance using a random nodejs version
      nodejs : {
        options: {
          machine: {
            name: 'grunt-nodejs-roulette'
          },
          image: function (images) {
            var nodejs = [];
            images.forEach(function (img) {
              if (img.name.indexOf('node') !== -1) {
                nodejs.push(img);
              }
            });
            // Grab a random nodejs image.
            return nodejs[Math.floor(Math.random()*nodejs.length)].id;
          },
          package: {
            memory: 128
          }
        }
      },

      // create a 128MB nginx instance and wait for nginx to startup
      nginxwait: {
        options: {
          waitForHTTP: true,
          machine: {
            name: 'grunt-nginxwait-128',
            tags: {
              role: 'www'
            },
            'metadata.user-script': grunt.file.read('user-script/nginxwait-user-script.sh'),
          },
          image: {
            name: 'nginx'
          },
          package: {
            memory: 128
          }
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'triton:nginx', 'triton:couchdb', 'triton:nodejs', 'triton:nginxwait']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
