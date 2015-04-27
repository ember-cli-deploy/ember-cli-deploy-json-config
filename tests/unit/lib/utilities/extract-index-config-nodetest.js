var assert = require('ember-cli/tests/helpers/assert');

var fs = require('fs');

describe('extract-index-config', function() {
  var subject;

  before(function() {
    subject = require('../../../../lib/utilities/extract-index-config');
  });

  it('extracts the correct config', function() {
    var contents = fs.readFileSync(process.cwd() + '/tests/fixtures/dist/index.html');

    return assert.isFulfilled(subject(contents))
      .then(function(config) {
        var json = JSON.parse(config);

        assert.equal(Object.keys(json).length, 4);

        assert.deepEqual(json.base[0], { href: '/' });
        assert.deepEqual(json.meta[0], { name: 'my-app/config/environment', content: 'some-config-values' });
        assert.deepEqual(json.link[0], { rel: 'stylesheet', href: 'assets/vendor.css' });
        assert.deepEqual(json.link[1], { rel: 'stylesheet', href: 'assets/app.css' });
        assert.deepEqual(json.script[0], { src: 'assets/vendor.js' });
        assert.deepEqual(json.script[1], { src: 'assets/app.js' });
      });
  });
});
