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
  var blueprint = this.readConfig('jsonBlueprint');
  var json = {};

  for(var prop in blueprint) {
    var value = blueprint[prop];

    if (value.selector && value.attributes) {
      json[prop] = _get($, value.selector, value.attributes);
    }
  }

  return RSVP.resolve(JSON.stringify(json));
};
