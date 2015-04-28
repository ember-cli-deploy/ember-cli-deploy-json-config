'use strict';

var fs     = require('fs');
var path   = require('path');
var assert = require('ember-cli/tests/helpers/assert');

describe('the deploy plugin object', function() {
  var subject;
  var fakeRoot;

  before(function() {
    subject = require('../../index');
    fakeRoot =  process.cwd() + '/tests/fixtures';
  });

  beforeEach(function() {
    var jsonPath = fakeRoot + '/dist/index.json';
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }
  });

  it('has a name', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal('test-plugin', result.name);
  });

  it('implements the correct hooks', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(typeof result.willDeploy, 'function');
    assert.equal(typeof result.didBuild, 'function');
  });

  describe('willDeploy hook', function() {
    it('resolves if config is ok', function() {
      var plugin = subject.createDeployPlugin({
        name: 'json-config'
      });

      var context = {
        deployment: {
          ui: { write: function() {}, writeLine: function() {} },
          config: {
            'json-config': {
              fileInputPattern: 'dist/index.html',
              fileOutputPattern: 'dist/index.json'
            }
          }
        }
      };

      return assert.isFulfilled(plugin.willDeploy.call(plugin, context))
    });
  });

  describe('didBuild hook', function() {
    it('generates index.json from index.html', function() {
      var plugin = subject.createDeployPlugin({
        name: 'json-config'
      });

      var context = {
        distDir: 'dist',
        deployment: {
          project: { root: fakeRoot },
          ui: {write: function() {}, writeLine: function() {}},
          config: {
            'json-config': {
              fileInputPattern: 'index.html',
              fileOutputPattern: 'index.json'
            }
          }
        },
        data: {}
      };

      var promise = plugin.didBuild.call(plugin, context);
      return assert.isFulfilled(promise)
        .then(function() {
          var json = require(fakeRoot + '/dist/index.json');

          assert.equal(Object.keys(json).length, 4);

          assert.deepEqual(json.base[0], { href: '/' });
          assert.deepEqual(json.meta[0], { name: 'my-app/config/environment', content: 'some-config-values' });
          assert.deepEqual(json.link[0], { rel: 'stylesheet', href: 'assets/vendor.css' });
          assert.deepEqual(json.link[1], { rel: 'stylesheet', href: 'assets/app.css' });
          assert.deepEqual(json.script[0], { src: 'assets/vendor.js' });
          assert.deepEqual(json.script[1], { src: 'assets/app.js' });
        });
    });

    it ('returns the index.json path', function() {
      var plugin = subject.createDeployPlugin({
        name: 'json-config'
      });

      var data = {};
      var context = {
        distDir: 'dist',
        deployment: {
          project: { root: fakeRoot },
          ui: {write: function() {}, writeLine: function() {}},
          config: {
            'json-config': {
              fileInputPattern: 'index.html',
              fileOutputPattern: 'index.json'
            }
          }
        }
      };

      var promise = plugin.didBuild.call(plugin, context);
      return assert.isFulfilled(promise)
        .then(function(result) {
          assert.deepEqual(result.distFiles, ['index.json']);
        });
    });
  });
});
