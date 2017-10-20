/*eslint-env node*/
var cheerio   = require('cheerio');
var RSVP      = require('rsvp');

function _get($, selector, attributes, includeContent, includeHtmlContent) {
  attributes = attributes || [];
  includeContent = includeContent || false;
  includeHtmlContent = includeHtmlContent || false;
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

    var html = $tag.html().trim();
    if (includeHtmlContent && html.length) {
      data['htmlContent'] = html;
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
      json[prop] = _get($, value.selector, value.attributes, value.includeContent, value.includeHtmlContent);
    }
  }

  return RSVP.resolve(JSON.stringify(json));
};
