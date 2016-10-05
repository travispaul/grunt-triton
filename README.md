# grunt-triton

> Provision a Triton instance from  your Gruntfile.

## Getting Started
This plugin requires Grunt `~0.4.5`

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

When set to `false`, wait for instance to be in the 'running' state.
When set to `true` task is completed immediately after creating the machine.

#### options.client
Type: `Object`

Default value: `{profileName: 'env'}`

Passed directly to `triton.createClient`.  Default uses the `TRITON_*` or `SDC_*` environment variables.

#### options.image
Type: `Object` or `Function`

Default value: `{name: 'minimal-64-lts'}`

If an `Object` is supplied with a `name` key, all images in Triton are searched for an image with the supplied name.

If a `Function` is supplied, an `Array` of package `Objects` is supplied as the first parameter and the user
can do their own filtering or searching on the images.  The user-supplied `Function` must return a package ID.

If machine.package is set this option is ignored.

#### options.machine

#### options.package
Type: `Object` or `Function`

Default value: `{memory: 128}`

If an `Object` is supplied with a `memory` key, all packages in Triton are searched for an package with the supplied amount of memory.

If a `Function` is supplied, an `Array` of package `Objects` is supplied as the first parameter and the user
can do their own filtering or searching on the packages.  The user supplied `Function` must return a package ID.

If machine.package is set this option is ignored.

#### options.test
Type: `Boolean`

Default value: `false`

When set to `true` machine is not created but info that would be passed to `createMachine` is shown on the console.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  triton: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  triton: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
