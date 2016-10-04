/*
 * grunt-triton
 * https://github.com/travispaul/grunt-triton
 *
 * Copyright (c) 2016 Travis Paul
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('triton', 'Provision a Triton instance from  your Gruntfile.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({

      client: {
        profileName: 'env'
      },

      // passed directly to createMachine
      machine: {
        name: null,
        tags: null
      },
      
      // false: waits for instance to be in the 'running' state
      // true: completes the task after creating the instance
      // ignored when waitFor options are present
      async: false,

      // when truth and user provides no waitFor options, defaults are used.
      waitForHTTP: false,

      // waitFor option defaults
      waitFor:{

        // finish the task when HTTP is ready
        http: {

          // false: uses instance's public IP
          // true: Use CNS instance FQDN
          useCns: false,

          // http or https
          proto: 'http',

          // if false, defaults to either 80 or 443 depending on proto
          port: 80,

          // Type of HTTP request to make
          method: 'HEAD',

          // expected response status
          status: 200,

          // check every interval seconds
          interval: 1,
          
          // give up after this many intervals
          timeout: 30,
          
          // show a . for each interval
          twiddle: true,

        }

      },
     
      // Use first package that meets this minimum criteria 
      // only used if no package uuid set in machine{}
      package: {
        memory: null,
        disk: null,
        swap: null,
        vcpus: null,
        lwps: null

      },

      // Use first image found that meets this criteria 
      // only used if no image uuid set in machine{}
      image: {
        name: null,
        os: null,
        tags: null
      }

    });
    console.log(options);
  });

};
