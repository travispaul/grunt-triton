'use strict';

var merge = require('deepmerge');

const CREATE_SYNC_INTERVAL = 5000;

module.exports = function(grunt) {
  grunt.registerMultiTask('triton', 'Provision a Triton instance from  your Gruntfile.', function() {
    var
      done = this.async(),
      triton = require('triton'),
      bunyan = require('bunyan'),
      request = require('request'),
      auth = require('smartdc-auth'),
      options = merge({
        test: false,
        client: {
          profileName: 'env'
        },
        package: {
          memory: 128
        },
        image: {
          name: 'minimal-64-lts'
        },
        machine: {},
        async: false,

        waitForHTTP: false,

        // waitFor option defaults
        waitFor: {

          // finish the task when HTTP is ready
          http: {

            // XXX: TODO
            // false: uses instance's public IP
            // true: Use CNS instance FQDN
            //useCns: false,

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

        }
      }, this.options()),
      api = {
        triton: triton.createClient(options.client),
        // XXX pull these out of triton client config dont assume `env`?
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
          [options.waitFor.http.method.toLowerCase()](url)
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
        if (!options.image) {
          grunt.fatal('No package search criteria');
        }
        api.triton.listImages(function (error, imgs) {
          if (error) throw error;
          if (typeof options.image === 'function') {
            return callback(options.image(imgs));
          }
          var result;
          imgs.forEach(function (img) {
            if (img.name === options.image.name) {
              result = img.id;
            }
          });
          if (!result) {
            grunt.fatal(`Unable to find image with name "${options.image.name}"`);
          }
          callback(result);
        });
      },
      findPackage = function (callback) {
        if (options.machine.package) {
          return callback(options.machine.package);
        }
        if (!options.package) {
          grunt.fatal('No package search criteria');
        }
        api.cloud.listPackages(function (error, pkgs) {
          if (error) throw error;
          if (typeof options.package === 'function') {
            return callback(options.package(pkgs));
          }
          var result;
          pkgs.forEach(function (pkg) {
            if (pkg.memory === options.package.memory) {
              result = pkg.id;
            }
          });
          if (!result) {
            grunt.fatal(`Unable to find package with ${options.package.memory} of memory`);
          }
          callback(result);
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
              if (options.waitForHTTP) {
                var url = `${options.waitFor.http.proto}://${instance.primaryIp}:${options.waitFor.http.port}`;
                grunt.log.writeln();
                grunt.log.ok(`Waiting for HTTP ${options.waitFor.http.method} response from: ${url}`);
                retry(url, function (error) {
                  if (error) throw error;
                  callback(instance);
                });
              } else {
                callback(instance);
              }
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
      if (!img || img.length !== 36) {
        grunt.fatal(`"${img}" is not a valid image ID`);
      } else {
        grunt.log.ok(`Using image: ${img}`);
      }
      options.machine.image = img;
      findPackage(function (pkg) {
        if (!pkg || pkg.length !== 36) {
          grunt.fatal(`"${pkg}" is not a valid package ID`);
        } else {
          grunt.log.ok(`Using package ${pkg}`);
        }
        options.machine.package = pkg;
        if (options.test) {
          grunt.log.ok('Stopping due to test = true');
          console.log(options.machine);
          return done();
        }
        createMachine[options.async ? 'async' : 'sync'](function (machine) {
          grunt.log.writeln();
          grunt.log.ok(`Instance created: ${machine.id}`);
          grunt.log.ok(`Primary IP: ${machine.primaryIp}`);
          done();
        });
      });
    });
  });
};