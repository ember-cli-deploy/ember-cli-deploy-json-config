/* jshint node: true */
'use strict';

var path      = require('path');
var fs        = require('fs');
var RSVP      = require('rsvp');
var Promise   = RSVP.Promise;
var denodeify = RSVP.denodeify;

var readFile  = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

var extractConfigFromHtmlAsJson  = require('./lib/utilities/extract-index-config');
var DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-json-config',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        fileInputPattern: 'index.html',
        fileOutputPattern: 'index.json',
        projectRoot: function(context) {
          return context.project.root;
        },
        distDir: function(context) {
          return context.distDir || 'tmp/deploy-dist';
        },
        jsonBlueprint: {
          base: {
            selector: 'base',
            attributes: ['href']
          },
          meta: {
            selector: 'meta[name*="/config/environment"]',
            attributes: ['name', 'content']
          },
          link: {
            selector: 'link',
            attributes: ['rel', 'href', 'integrity']
          },
          script: {
            selector: 'script',
            attributes: ['src', 'integrity'],
            captureText: true
          }
        }
      },

      didBuild: function(context) {
        var root               = this.readConfig('projectRoot');
        var distDir            = this.readConfig('distDir');
        var fileInputPattern   = this.readConfig('fileInputPattern');
        var fileOutputPattern  = this.readConfig('fileOutputPattern');
        var inputPath          = path.join(distDir, fileInputPattern);
        var outputPath         = path.join(distDir, fileOutputPattern);
        var absoluteInputPath  = path.resolve(root, inputPath);
        var absoluteOutputPath = path.resolve(root, outputPath);

        this.log('generating `' + outputPath + '` from `' + inputPath + '`', { verbose: true });

        return readFile(absoluteInputPath)
          .then(extractConfigFromHtmlAsJson.bind(this))
          .then(writeFile.bind(writeFile, absoluteOutputPath))
          .then(this._successMessage.bind(this, outputPath, fileOutputPattern))
          .then(function() {
            return { distFiles: [fileOutputPattern] };
          })
          .catch(this._errorMessage.bind(this));
      },

      _successMessage: function(outputPath, fileOutputPattern) {
        this.log('generated: `' + outputPath + '`', { verbose: true });
        this.log('added `' + fileOutputPattern + '` to `context.distFiles`', { verbose: true });
        return Promise.resolve();
      },

      _errorMessage: function(error) {
        this.log(error, { color: 'red' });
        if (error) {
          this.log(error.stack, { color: 'red' });
        }
        return Promise.reject(error);
      }
    });

    return new DeployPlugin();
  }
};
