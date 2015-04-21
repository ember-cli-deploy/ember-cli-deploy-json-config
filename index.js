/* jshint node: true */
'use strict';

var cheerio   = require('cheerio');
var path      = require('path');
var fs        = require('fs');
var RSVP      = require('rsvp');
var denodeify = RSVP.denodeify;

var readFile  = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

module.exports = {
  name: 'ember-cli-deploy-json-config',

  createDeployPlugin: function(options) {
    return {
      name: options.name,

      build: function(context) {
        var project    = context.project;
        var root       = project.root;
        var distPath   = path.join(root, 'dist');
        var indexPath  = path.join(distPath, 'index.html');
        var outputPath = path.join(distPath, 'index.json');

        return readFile(indexPath)
          .then(this._extractConfig.bind(this), this._handleMissingFile)
          .then(writeFile.bind(this, outputPath))
          .then(function() {
            context.data.indexPath = outputPath;
          });
      }.bind(this)
    }
  },

  _extractConfig: function(data) {
    var $ = cheerio.load(data.toString());
    var json = {
      base: this._get($, 'base', ['href']),
      meta: this._get($, 'meta[name*="/config/environment"]', ['name', 'content']),
      link: this._get($, 'link', ['rel', 'href']),
      script: this._get($, 'script', ['src'])
    };

    return RSVP.resolve(JSON.stringify(json));
  },

  _handleMissingFile: function() {
    return RSVP.resolve();
  },

  _get: function($, selector, attributes) {
    attributes = attributes || [];
    var config = [];
    var $tags = $(selector);

    $tags.each(function() {
      var $tag = $(this);

      var data = attributes.reduce(function(data, attribute) {
        data[attribute] = $tag.attr(attribute);

        return data;
      }, {});

      config.push(data);
    });

    return config;
  }
};
