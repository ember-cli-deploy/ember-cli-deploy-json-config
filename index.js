/* jshint node: true */
'use strict';

var path      = require('path');
var fs        = require('fs');
var chalk     = require('chalk');
var RSVP      = require('rsvp');
var Promise   = RSVP.Promise;
var denodeify = RSVP.denodeify;

var readFile  = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

var blue      = chalk.blue;
var red       = chalk.red;

var validateConfig = require('./lib/utilities/validate-config');
var extractConfig  = require('./lib/utilities/extract-index-config');

module.exports = {
  name: 'ember-cli-deploy-json-config',

  createDeployPlugin: function(options) {
    function _beginMessage(ui, inputPattern, outputPattern) {
      ui.write(blue('|      '));
      ui.writeLine(blue('- generating `' + outputPattern + '` from `' + inputPattern + '`'));

      return Promise.resolve();
    }

    function _successMessage(ui, outputPattern) {
      ui.write(blue('|      '));
      ui.writeLine(blue('- generated: `' + outputPattern + '`'));

      return Promise.resolve(outputPattern);
    }

    function _errorMessage(ui, error) {
      ui.write(blue('|      '));
      ui.write(red('- ' + error + '`\n'));

      return Promise.reject(error);
    }

    return {
      name: options.name,

      willDeploy: function(context) {
        var deployment = context.deployment;
        var ui         = deployment.ui;
        var config     = deployment.config[this.name] = deployment.config[this.name] || {};

        return validateConfig(ui, config)
          .then(function() {
            ui.write(blue('|    '));
            ui.writeLine(blue('- config ok'));
          });
      },

      didBuild: function(context) {
        var deployment = context.deployment;
        var ui         = deployment.ui;
        var config     = deployment.config[this.name];
        var project    = deployment.project;
        var root       = project.root;

        var fileInputPattern  = config.fileInputPattern;
        var fileOutputPattern = config.fileOutputPattern;
        var inputPath         = path.join(root, fileInputPattern);
        var outputPath        = path.join(root, fileOutputPattern);

        return _beginMessage(ui, fileInputPattern, fileOutputPattern)
          .then(readFile.bind(readFile, inputPath))
          .then(extractConfig.bind(this))
          .then(writeFile.bind(writeFile, outputPath))
          .then(_successMessage.bind(this, ui, fileOutputPattern))
          .then(function(outputPattern) {
            return { distFiles: [outputPattern] };
          })
          .catch(_errorMessage.bind(this, ui));
      }
    }
  }
};
