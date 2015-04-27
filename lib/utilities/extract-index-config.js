var cheerio   = require('cheerio');
var RSVP      = require('rsvp');

function _get($, selector, attributes) {
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

module.exports = function(data) {
  var $ = cheerio.load(data.toString());
  var json = {
    base: _get($, 'base', ['href']),
    meta: _get($, 'meta[name*="/config/environment"]', ['name', 'content']),
    link: _get($, 'link', ['rel', 'href']),
    script: _get($, 'script', ['src'])
  };

  return RSVP.resolve(JSON.stringify(json));
};
