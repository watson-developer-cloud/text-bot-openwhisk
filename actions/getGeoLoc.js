/**
 * Calls the Weather API and returns the Geolocation for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.conversation.city The conversation city parameter, if null this action doesn't do anything.
 * @param {String} params.conversation.city.name The city name.
 */
const assert = require('assert');

function main(params) {
  return new Promise(function(resolve, reject) {
    assert(params, 'params can not be null');
    assert(params.WEATHER_USERNAME, 'params.WEATHER_USERNAME can not be null');
    assert(params.WEATHER_PASSWORD, 'params.WEATHER_PASSWORD can not be null');
    assert(params.conversation.context, 'params.conversation.context can not be null');
    assert(params.conversation.context.city, 'params.conversation.context.city can not be null');

    if (!params || !params.conversation.context.city.name || params.conversation.context.state) {
      var output = params._id
        ? Object.assign({}, {
          conversation: params.conversation
        }, {
          _id: params._id
        }, {_rev: params._rev})
        : Object.assign({}, {conversation: params.conversation});
      resolve(output);
    } else {
      const request = require('request');
      const method = '/v3/location/search';
      const url = 'https://twcservice.mybluemix.net/api/weather' || params.WEATHER_URL;

      request({
        method: 'GET',
        url: url + method,
        auth: {
          username: params.WEATHER_USERNAME,
          password: params.WEATHER_PASSWORD,
          sendImmediately: true
        },
        jar: true,
        json: true,
        qs: {
          query: params.conversation.context.city.name,
          locationType: 'city',
          countryCode: 'US',
          language: 'en-US'
        }
      }, function(error, response, body) {
        var latitudes = body.location.latitude;
        var longitudes = body.location.longitude;
        var abbrList = body.location.adminDistrictCode;
        var statesList = body.location.adminDistrict;
        // map the latitude and longitude values to each other
        var coordinates = latitudes.map((x, i) => {
          return {'latitude': x, 'longitude': longitudes[i]};
        });

        var states = {};
        var abbreviations = {};

        statesList.forEach(function(state, i) {
          states[state] = {
            longitude: coordinates[i].longitude,
            latitude: coordinates[i].latitude
          };
        });

        abbrList.forEach(function(abbr, i) {
          abbreviations[abbr] = {
            full: statesList[i]
          };
        });

        var output = params._id
          ? Object.assign({}, {
            conversation: params.conversation
          }, {
            _id: params._id
          }, {_rev: params._rev})
          : Object.assign({}, {conversation: params.conversation});
        output.conversation.context.city.states = states;
        output.conversation.context.abbreviations = abbreviations;

        if (params.conversation.context.city.number_of_states === null) {
          output.conversation.context.city.number_of_states = body.location.adminDistrict.length;

          if (params.conversation.context.city.number_of_states === 1) {
            output.conversation.context.state = body.location.adminDistrict[0];
          }
        }

        if (error || response.statusCode != 200) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    }
  });
}
module.exports.main = main;
