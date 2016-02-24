var cheerio   = require('cheerio');
var RSVP      = require('rsvp');

function _get($, selector, attributes, captureText) {
  attributes = attributes || [];
  captureText = captureText || false
  var config = [];
  var $tags = $(selector);

  $tags.each(function() {
    var $tag = $(this);

    var data = attributes.reduce(function(data, attribute) {
      data[attribute] = $tag.attr(attribute);

      return data;
    }, {});

    if (captureText && !!$tag.text()) {
      data['text'] = $tag.text(); 
    }

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
      json[prop] = _get($, value.selector, value.attributes, value.captureText);
    }
  }

  return RSVP.resolve(JSON.stringify(json));
};
