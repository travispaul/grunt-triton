# grunt-triton

> Provision a Triton instance from  your Gruntfile.

See Also:
* https://github.com/joyent/node-triton
* https://apidocs.joyent.com/cloudapi
* https://www.joyent.com/triton

## Getting Started
This plugin requires Grunt `~0.4.5`

If you know what you're doing and want to see some examples take a look at this project's [Gruntfile.js](https://github.com/travispaul/grunt-triton/blob/master/Gruntfile.js#L31).

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-triton --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-triton');
```

## The "triton" task

### Overview
In your project's Gruntfile, add a section named `triton` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  triton: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.async
Type: `Boolean`
Default value: `false`

When set to `false`, the task waits for the newly created instance to be in the 'running' state before running the next task.
When set to `true`, the task is completed immediately after creating the machine.

#### options.client
Type: `Object`
Default value: `{profileName: 'env'}`

Passed directly to node-triton's [createClient](https://github.com/joyent/node-triton#tritonapi-module-usage) function.  Default uses the `TRITON_*` or `SDC_*` environment variables.

#### options.image
Type: `Object` or `Function`
Default value: `{name: 'minimal-64-lts'}`

If an `Object` is supplied with a `name` key, all images in Triton are searched for an image with the supplied name.

If a `Function` is supplied, the task calls the function and passes in an `Array` of image `Objects` as the first argument.  The user can then perform their own filtering or searching on the images and return the desired image ID.

If `machine.package` is set this option is ignored.

See [listImages](https://apidocs.joyent.com/cloudapi/#ListImages) for more info.

#### options.machine
Type: `Object`
Default value: `{}`

Passed directly to [createMachine](https://apidocs.joyent.com/cloudapi/#CreateMachine).

#### options.package
Type: `Object` or `Function`
Default value: `{memory: 128}`

If an `Object` is supplied with a `memory` key, all packages in Triton are searched for a package with the requested amount of memory and the last package found is returned.

If a `Function` is supplied, the task calls the function and passes in an `Array` of package `Objects` as the first argument.  The user can then perform their own filtering or searching on the packages and return the desired package ID.

If `machine.package` is set this option is ignored.

See [listPackages](https://apidocs.joyent.com/cloudapi/#ListPackages) for more info.

#### options.test
Type: `Boolean`
Default value: `false`

When set to `true` the machine is not created but info that would be passed to `createMachine` is shown on the console.

#### options.waitForHTTP
Type: `Boolean`
Default value: `false`

When set to `true` the plugin will make HEAD requests to the machine's IP address until it receives a successful response.

#### options.http
Type: `Object`
default values:

The properties listed below are only used when `waitForHTTP` is `true`.

##### options.http.proto
Type: `String`
default: `http`

Can be either http or https.

##### options.http.port
Type: `Integer`
default: `80`

Defaults to 80, must be set to 443 for https, can be set to any desired port number.


##### options.http.method
Type: `String`
default: `HEAD`

Can also be ``GET``.

##### options.http.interval
Type: `Integer`
default: `1000`

Check for an HTTP response every `interval` milliseconds.

##### options.http.attempts
Type: `Integer`
default: `30`

Return unsuccessful after this many checks.

##### options.http.twiddle
Type: `Boolean`
default: `true`

When true a `.` is show for each HTTP request made.


### Usage Examples

With no configuration grunt-triton will create a 128MB SmartOS instance and wait for it to start.  See this repo's [Gruntfile.js](https://github.com/travispaul/grunt-triton/blob/master/Gruntfile.js#L31) for more detailed examples.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


## Note

This is **not** an official Joyent project.  Use at your own risk, you **will** be billed for any resources you create.
