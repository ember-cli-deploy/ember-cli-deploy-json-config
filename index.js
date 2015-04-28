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
    function _beginMessage(ui, inputPath, outputPath) {
      ui.write(blue('|    '));
      ui.writeLine(blue('- generating `' + outputPath + '` from `' + inputPath + '`'));

      return Promise.resolve();
    }

    function _successMessage(ui, outputPath) {
      ui.write(blue('|    '));
      ui.writeLine(blue('- generated: `' + outputPath + '`'));

      return Promise.resolve();
    }

    function _errorMessage(ui, error) {
      ui.write(blue('|    '));
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

        var root               = project.root;
        var distDir            = context.distDir;
        var fileInputPattern   = config.fileInputPattern;
        var fileOutputPattern  = config.fileOutputPattern;
        var inputPath          = path.join(distDir, fileInputPattern);
        var outputPath         = path.join(distDir, fileOutputPattern);
        var absoluteInputPath  =  path.join(root, inputPath);
        var absoluteOutputPath =  path.join(root, outputPath);

        return _beginMessage(ui, inputPath, outputPath)
          .then(readFile.bind(readFile, absoluteInputPath))
          .then(extractConfig.bind(this))
          .then(writeFile.bind(writeFile, absoluteOutputPath))
          .then(_successMessage.bind(this, ui, outputPath))
          .then(function() {
            ui.write(blue('|    '));
            ui.writeLine(blue('- added `' + fileOutputPattern + '` to `context.distFiles`'));

            return { distFiles: [fileOutputPattern] };
          })
          .catch(_errorMessage.bind(this, ui));
      }
    }
  }
};
