'use strict';

var assert = require('ember-cli/tests/helpers/assert');

var fs = require('fs');

describe('extract-index-config', function() {
  var subject;

  before(function() {
    subject = require('../../../../lib/utilities/extract-index-config');
  });

  it('extracts the correct config', function() {
    var contents = fs.readFileSync(process.cwd() + '/tests/fixtures/dist/index.html');

    var plugin = {
      combinedBlueprint: {
        base: {
          selector: 'base',
          attributes: ['href']
        },
        script: {
          selector: 'script',
          attributes: ['src']
        }
      }
    };

    return assert.isFulfilled(subject.call(plugin, contents))
      .then(function(config) {
        var json = JSON.parse(config);

        assert.equal(Object.keys(json).length, 2);

        assert.deepEqual(json.base[0], { href: '/' });
        assert.deepEqual(json.script[0], { src: 'assets/vendor.js' });
        assert.deepEqual(json.script[1], { src: 'assets/app.js' });
      });
  });
});
