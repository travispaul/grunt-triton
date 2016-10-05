'use strict';

var merge = require('deepmerge');

const CREATE_SYNC_INTERVAL = 3500;

module.exports = function(grunt) {
  grunt.registerMultiTask('triton', 'Provision a Triton instance from  your Gruntfile.', function() {
    var
      done = this.async(),
      triton = require('triton'),
      bunyan = require('bunyan'),
      request = require('request'),
      auth = require('smartdc-auth'),
      options = merge({
        // Show the machine that will be created but don't create it
        // can also use --test
        test: false,

        // passed directly to createClient
        client: {
          profileName: 'env'
        },

        // passed directly to createMachine
        machine: {},

        // false: waits for instance to be in the 'running' state
        // true: completes the task after creating the machine
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

            // check every interval milliseconds
            interval: 1000,
            
            // give up after this many checks
            attempts: 30,
            
            // show a . for each interval
            twiddle: true

          }

        },
       
        // Use first package that meets this minimum criteria 
        // only used if no package uuid set in machine{}
        package: {
          memory: null
        },

        // Use first image found that meets this criteria 
        // only used if no image uuid set in machine{}
        image: {
          name: null
        }

      }, this.options()),
      api = {
        triton: triton.createClient(options.client),
        cloud: triton.createCloudApiClient({
          url: process.env.TRITON_URL || process.env.SDC_URL,
          account: process.env.TRITON_ACCOUNT || process.env.SDC_ACCOUNT,
          log: bunyan.createLogger({name: 'api'}),
          sign: auth.cliSigner({
            keyId: process.env.TRITON_KEY_ID || process.env.SDC_KEY_ID,
            user: process.env.TRITON_ACCOUNT || process.env.SDC_ACCOUNT,
            log: bunyan.createLogger({name: 'sign'})
          })
        })
      },
      retryAttempts = null,
      retry = function (url, callback) {
        retryAttempts += 1;
        request
          .get(url)
          .on('error', function(error) {
            if (retryAttempts <= options.waitFor.http.attempts) {
              if (options.waitFor.http.twiddle) {
                grunt.log.write('.');
              }
              setTimeout(function () {
                retry(url, callback);
              }, options.waitFor.http.interval);
            } else {
              callback(error);
            }
          })
          .on('response', function () {
            callback();
          });
      },
      findImage = function (callback) {
        if (options.machine.image) {
          return callback(options.machine.image);
        }
        api.triton.listImages(function (error, imgs) {
          if (error) throw error; 
          var result = [];
          imgs.forEach(function (img) {
            if (img.name === options.image.name) {
              result.push(img);
            }
          });
          callback(result.pop());
        });
      },
      findPackage = function (callback) {
        if (options.machine.package) {
          return callback(options.machine.package);
        }
        api.cloud.listPackages(function (error, pkgs) {
          if (error) throw error; 
          var result = [];
          pkgs.forEach(function (pkg) {
            if (pkg.memory <= options.package.memory) {
              result.push(pkg);
            }
          });
          callback(result.pop());
        });
      },
      createMachine = {
        sync: function (callback) {
          api.cloud.createMachine(options.machine, function (error, machine) {
            if (error) throw error; 
            machine.states = ['running'];
            grunt.log.ok(`Waiting for instance to start: ${machine.id}`);
            (function twiddle() {
              if (retryAttempts === null) {
                grunt.log.write('.');
                setTimeout(function () {
                  twiddle();
                }, CREATE_SYNC_INTERVAL);
              }
            })();
            api.cloud.waitForMachineStates(machine, function (error, instance) {
              if (error) throw error; 
              callback(instance);
            });
          });
        },
        async: function (callback) {
          api.cloud.createMachine(options.machine, function (error, machine) {
            if (error) throw error; 
            callback(machine);
          });
        }
      };

    findImage(function (img) {
      options.machine.image = img.id;
      findPackage(function (pkg) {
        options.machine.package = pkg.id;
        createMachine[options.async ? 'async' : 'sync'](function (machine) {
          console.log(machine);
          done();
        });
      });
    });

    console.log(options);

  });

};