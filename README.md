# ember-cli-deploy-json-config

> An ember-cli-deploy plugin to convert index.html to json config

<hr/>
**WARNING: This plugin is only compatible with ember-cli-deploy versions >= 0.5.0**
<hr/>

This plugin will take an index.html file and extract the data from it, outputting it to JSON. This can be used by a web server that might want to have more control over the templating of the index.html file on the server while still being able to point to the ember-cli assets deployed by ember-cli-deploy.

For a more in depth use case as to why one might want to use this plugin, refer to "[Why would I use this plugin?](#why-would-i-use-this-plugin)"

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start
To get up and running quickly, do the following:

- Ensure [ember-cli-deploy-build][2] is installed and configured

- Install this plugin

```bash
$ ember install ember-cli-deploy-json-config
```

- Run the pipeline

```bash
$ ember deploy
```

## Installation
Run the following command in your terminal:

```bash
ember install ember-cli-deploy-json-config
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

- `configure`
- `didBuild`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

### fileInputPattern

A pattern that matches the file you would like to convert to JSON. This pattern should be relative to `distDir`.

*Default:* `'index.html'`

### fileOutputPattern

A pattern that matches the file you would like to output the JSON to. This pattern should be relative to `distDir`.

*Default:* `index.json`

### distDir

The root directory where the file matching `fileInputPattern` will be searched for. By default, this option will use the `distDir` property of the deployment context.

*Default:* `context.distDir`

## What does a converted index.html file look like?

The basic index.html file built by ember-cli will look soemething like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>DummyApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <base href="/" />
    <meta name="dummy-app/config/environment" content="%7B22modulePrefix%22%3A%22dummy-app%22%7D" />

    <link rel="stylesheet" href="assets/vendor.css">
    <link rel="stylesheet" href="assets/dummy-app.css">
  </head>

  <body>
    <script src="assets/vendor.js"></script>
    <script src="assets/dummy-app.js"></script>
  </body>
</html>
```

This index.html is used to boot the ember app by retrieving the relevant js and css. By using this plugin, we can retrieve all the important information and store it in a JSON format.  It looks something like this:

```json
{
  "base": [
    {
      "href": "/"
    }
  ],
  "meta": [{"name":"dummy-app/config/environment","content":"%7B22modulePrefix%22%3A%22dummy-app%22%7D"}],
  "link": [
    {
      "rel": "stylesheet",
      "href": "assets/vendor.css"
    },
    {
        "rel": "stylesheet",
        "href": "assets/dummy-app.css"
    }
  ],
  "script": [
    {
      "src": "assets/vendor.js"
    },
    {
      "src": "assets/dummy-app.js"
    }
  ]
}
```

## Why would I use this plugin?

Take an example where an ember-cli app is actually just a small part of a larger Rails application. In this case, as the ember-cli app is not the entire application it doesn't make sense to be serving the index.html file built by ember-cli to the browser.  Instead, the Rails app wants serve the Rails application which would include the ember-cli app.

In this case it would make sense to store the links to the assets etc in JSON which the Rails server can retrieve. It can then cycle through the properties and merge them into the ERB view that will be served to the browser.

This allows the server to have much more control over the template and the presentation that surrounds an ember-cli app.

## Prerequisites

The following properties are expected to be present on the deployment `context` object:

- `distDir`                     (provided by [ember-cli-deploy-build][2])
- `project.root`                (provided by [ember-cli-deploy][3])

## Plugins known to work well with this one

[ember-cli-deploy-redis](https://github.com/ember-cli-deploy/ember-cli-deploy-redis)

## Running Tests

- `npm test`

[1]: http://ember-cli.github.io/ember-cli-deploy/plugins "Plugin Documentation"
[2]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
[3]: https://github.com/ember-cli/ember-cli-deploy "ember-cli-deploy"
