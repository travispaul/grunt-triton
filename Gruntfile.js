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
        'tasks/*.js',
        '<%= nodeunit.tests %>'
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
      nginx: {
        options: {
          machine: {
            name: 'nginx-128',
            tags: {
              role: 'www'
            },
            'metadata.user-script': grunt.file.read('nginx-user-script.sh'),
          },
          image: {
            name: 'nginx'
          },
          package: {
            memory: 128
          }
        }
      },
      couchdb: {
        options: {
          machine: {
            name: 'couchdb-512',
            tags: {
              role: 'api'
            },
            'metadata.couchdb_password': 'get from .couchrc perhaps?',
            'metadata.couchdb_bind_address': '0.0.0.0',
            'metadata.user-script': grunt.file.read('couchdb-user-script.sh'),
          },
          package: {
            memory: 512
          }
        }
      },
      nodejs : {
        options: {
          machine: {
            name: 'nodejs-roulette'
          },
          image: function (images) {
            var nodejs = [];
            images.forEach(function (img) {
              if (img.name.indexOf('node') != -1) {
                nodejs.push(img);
              }
            });
            // Grab a random nodejs image. Why not?
            return nodejs[Math.floor(Math.random()*nodejs.length)].id;
          },
          package: {
            memory: 128
          }
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'triton', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};