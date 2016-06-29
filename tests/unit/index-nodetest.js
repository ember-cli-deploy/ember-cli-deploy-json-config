'use strict';

var fs     = require('fs');
var path   = require('path');
var assert = require('ember-cli/tests/helpers/assert');

describe('the deploy plugin object', function() {
  var fakeRoot;
  var plugin;
  var promise;
  var distDir;
  var jsonBlueprint;
  var jsonBlueprintOverride;

  before(function() {
    fakeRoot = process.cwd() + '/tests/fixtures';
    distDir = 'dist';
    jsonBlueprint = null;
    jsonBlueprintOverride = null;
  });

  beforeEach(function() {
    var subject = require('../../index');
    var jsonPath = fakeRoot + '/dist/index.json';
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }

    var mockUi = {write: function() {}, writeLine: function() {}};

    plugin = subject.createDeployPlugin({
      name: 'json-config'
    });

    var context = {
      ui: mockUi,
      config: {
        'json-config': {
          fileInputPattern: 'index.html',
          fileOutputPattern: 'index.json',
          distDir: function(context) {
            return distDir;
          },
          projectRoot: function(context) {
            return fakeRoot;
          }
        }
      }
    };

    if (jsonBlueprint) {
      context.config['json-config'].jsonBlueprint = jsonBlueprint;
    }
    if (jsonBlueprintOverride) {
      context.config['json-config'].jsonBlueprintOverride = jsonBlueprintOverride;
    }

    plugin.beforeHook(context);
    plugin.configure(context);

    promise = plugin.didBuild.call(plugin, context);
  });

  it('has a name', function() {
    assert.equal('json-config', plugin.name);
  });

  it('implements the correct hooks', function() {
    assert.equal(typeof plugin.configure, 'function');
    assert.equal(typeof plugin.didBuild, 'function');
  });

  describe('didBuild hook', function() {
    it('generates index.json from index.html', function() {
      return assert.isFulfilled(promise)
        .then(function() {
          var json = require(fakeRoot + '/dist/index.json');

          assert.equal(Object.keys(json).length, 4);

          assert.deepEqual(json.base[0], { href: '/' });
          assert.deepEqual(json.meta[0], { name: 'my-app/config/environment', content: 'some-config-values' });
          assert.deepEqual(json.link[0], { rel: 'stylesheet', href: 'assets/vendor.css', integrity: 'sha256-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' });
          assert.deepEqual(json.link[1], { rel: 'stylesheet', href: 'assets/app.css' });
          assert.deepEqual(json.script[0], { src: 'assets/vendor.js', integrity: 'sha256-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' });
          assert.deepEqual(json.script[1], { src: 'assets/app.js' });
        });
    });

    it ('returns the index.json path', function() {
      return assert.isFulfilled(promise)
        .then(function(result) {
          assert.deepEqual(result.distFiles, ['index.json']);
        });
    });

    describe('when the distDir is an absolute path', function() {
      before(function() {
        distDir = fakeRoot + '/dist';
      });

      it('still works', function() {
        return assert.isFulfilled(promise)
          .then(function() {
            var json = require(fakeRoot + '/dist/index.json');

            assert.equal(Object.keys(json).length, 4);
          });
      });
    });
  });

  describe('configure hook', function() {
    it('combinedBlueprint echos the default config when there are no options set', function() {
      assert.deepEqual(plugin.defaultConfig.jsonBlueprint, plugin.combinedBlueprint);
    });
    describe('sending jsonBlueprint', function() {
      var newBlueprint = {
        script: {
          'foo': 'bar'
        }
      };
      before(function() {
        jsonBlueprint = newBlueprint;
        jsonBlueprintOverride = null;
      });

      it('changes combinedBlueprint', function() {
        assert.deepEqual(newBlueprint, plugin.combinedBlueprint);
      });
    });
    describe('send jsonBlueprintOverride', function() {

      var newScript = {
        'now': 'different'
      };
      before(function() {
        jsonBlueprint = null;
        jsonBlueprintOverride = {
          script: newScript
        };
      });

      it('modifies combinedBlueprint', function() {
        var original = JSON.parse(JSON.stringify(plugin.defaultConfig.jsonBlueprint));
        original.script = newScript;
        assert.deepEqual(original, plugin.combinedBlueprint);
      });
    });
    describe('send jsonBlueprintOverride with a new key', function() {

      var newBody = {
        'class': 'different'
      };
      before(function() {
        jsonBlueprint = null;
        jsonBlueprintOverride = {
          body: newBody
        };
      });

      it('appends to combinedBlueprint', function() {
        var original = JSON.parse(JSON.stringify(plugin.defaultConfig.jsonBlueprint));
        original.body = newBody;
        assert.deepEqual(original, plugin.combinedBlueprint);
      });
    });
    describe('send both jsonBlueprint and jsonBlueprintOverride', function() {
      var newScript = {
        'foo': 'bar'
      };
      var newBlueprint = {
        meta: {
          selector: 'meta[name*="/config/environment"]',
          attributes: ['name', 'content']
        },
        script: {
          selector: 'script',
          attributes: ['src', 'integrity']
        }
      };
      before(function() {
        jsonBlueprint = newBlueprint;
        jsonBlueprintOverride = {
          script: newScript
        }
      });

      it('still works', function() {
        var blueprint = JSON.parse(JSON.stringify(newBlueprint));
        blueprint.script = newScript;
        assert.deepEqual(blueprint, plugin.combinedBlueprint);
      });
    });
  });
});
