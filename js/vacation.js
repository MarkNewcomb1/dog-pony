$(function() {

  // CONSTANTS
  var BING_IMAGE_URL = 'https://api.datamarket.azure.com/Bing/Search/v1/Image'
    , BING_AUTH_HEADER = { Authorization: "Basic " + btoa(api_keys.bing) }
    , BING_DEFAULT_PAYLOAD = { $format: 'json', ImageFilters: "'Size:Large+Aspect:Wide'", Adult: "'Strict'" }

    , WEATHER_URL = 'http://api.worldweatheronline.com/free/v2/weather.ashx'
    , WEATHER_DEFAULT_PAYLOAD = { format: "json", num_of_days: 1, key: api_keys.weather };

  // state
  var destination; // currently not used, it was broken anyways.

  // cache DOM elements
  var nav = $('nav')
    , messaging = $('.messaging')
    , background = $('.hero')
    , weather = $('.weather')
    , weather_name = weather.find('.name')
    , weather_temp = weather.find('.temp')
    , weather_icon = weather.find('.icon')
    , weather_text = weather.find('.text');


  generateMenu(); // build html menu from data.

  // attach event listeners
  nav.on('click','.locationLink', function() {
    var link = $(this);

    messaging.empty();

    bingSearch(link.data('terms'));
    weatherSearch(link.data('weather'));
    showBlurb(link.data('index'));
  });


  // open menu with a delay
  setTimeout(function() {
    nav.animate({ bottom: '0px' }, 1500, 'easeOutBounce')
  }, 2700);


  /* HELPER FUNCTIONS BELOW */

  function generateMenu() {

    var ul = $('<ul />');

    locations.forEach(function(location, idx){
      var li = $("<li />");
      var link = $("<a />");

      link.addClass('locationLink')
          .data('index', idx)
          .data('terms', location.terms)
          .data('weather', location.weatherId)
          .text(location.name);

      li.append(link);
      ul.append(li);
    });

    nav.append(ul);
  }

  function search(url, data, headers, callback) {
    $.ajax({
      url: url
    , type: "GET"
    , dataType: "json"
    , data: data
    , headers: headers
    , success: callback });
  }

  function bingSearch(term) {
    var payload = $.extend({Query: "'" + term + "'"}, BING_DEFAULT_PAYLOAD)
    search(BING_IMAGE_URL, payload, BING_AUTH_HEADER, processBing);
  }

  function weatherSearch(location) {
    var payload = $.extend({q: location}, WEATHER_DEFAULT_PAYLOAD);
    search(WEATHER_URL, payload, {}, processWeather);
  }

  function processBing(result) {
    var index = Math.floor(Math.random() * 50) + 1
    var url = result.d.results[index].MediaUrl;

    background.hide().css({
        "background-image":"url(" + url + ")",
        "background-repeat":"no-repeat",
        "background-size":"cover",
        "background-color": "transparent"
    }).fadeIn(function() {
      $('video#bgvid,h1,.filter').remove();
    });
  }

  function processWeather(result) {
    if(!result || !result.data || !result.data.current_condition || !result.data.current_condition[0]) {
      return; // we have an error, abort!
    }

    var data = result.data.current_condition[0];

    weather_name.text(result.data.request[0].query);
    weather_temp.html(data.temp_F + "&deg;");
  // not currently used
  // weather_icon.empty().append("<img src='" + data.weatherIconUrl[0].value + "' alt='weather icon' />");
    weather_text.text(data.weatherDesc[0].value);
    weather.fadeIn();
  }

  function showBlurb(idx) {
    setTimeout(function() {
      messaging.html(locations[idx].blurb).animate({
        "right":"0px"
      }, 1500, "easeOutBounce");
    },1000);
  }


});
