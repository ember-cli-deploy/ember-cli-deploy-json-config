var cheerio   = require('cheerio');
var RSVP      = require('rsvp');

function _get($, selector, attributes, allowContent) {
  attributes = attributes || [];
  var config = [];
  var $tags = $(selector);

  $tags.each(function() {
    var $tag = $(this);
    var data = {};

    if (attributes.length) {
      data = attributes.reduce(function(data, attribute) {
        data[attribute] = $tag.attr(attribute);

        if(data[attribute] === undefined && allowContent) {
          data['content'] = $tag.text().trim();
        }

        return data;
      }, data);
    } else if (allowContent) {
      data['content'] = $tag.text().trim();
    }

    config.push(data);
  });

  return config;
}

module.exports = function(data) {
  var $ = cheerio.load(data.toString());
  var blueprint = this.readConfig('jsonBlueprint');
  var json = {};

  for (var prop in blueprint) {
    var value = blueprint[prop];

    if (value.selector) {
      json[prop] = _get($, value.selector, value.attributes, value.allowContent);
    }
  }

  return RSVP.resolve(JSON.stringify(json));
};
