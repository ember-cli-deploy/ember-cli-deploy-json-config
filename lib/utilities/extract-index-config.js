var cheerio   = require('cheerio');
var RSVP      = require('rsvp');

function _get($, selector, attributes, includeContent) {
  attributes = attributes || [];
  includeContent = includeContent || false;
  var config = [];
  var $tags = $(selector);

  $tags.each(function() {
    var $tag = $(this);

    var data = attributes.reduce(function(data, attribute) {
      data[attribute] = $tag.attr(attribute);

      return data;
    }, {});

    var content = $tag.text().trim();
    if (includeContent && content.length) {
      data['content'] = content;
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

    if ('selector' in value && ('attributes' in value || 'includeContent' in value)) {
      var attributes = 'attributes' in value?value.attributes:[];
      var includeContent = 'includeContent' in value?value.includeContent:false;
      json[prop] = _get($, value.selector, value.attributes, value.includeContent);
    }
  }

  return RSVP.resolve(JSON.stringify(json));
};
