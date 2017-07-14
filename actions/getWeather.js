console.log('getting weather');
/**
 * Calls the Weather API and returns the Weather for a given city.
 * @param {Object} params The parameters
 * @param {String} params.conversation.context.city.number_of_states The number of states for a city. If > 1, this is skipped.
 * @param {Object} params.conversation.context.city.states[state].latitude The latitude of the city.
 * @param {String} params.conversation.context.city.states[state].longitude The longitude of the city.
 */
function main(params) {
    if (!params || params.conversation.context.city.number_of_states !== 1 || params.conversation.context.weather_conditions) {
        console.log('skipping get weather');
        var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
        return output;
    } else {
        return new Promise(function(resolve, reject) {
            const request = require('request');

            const USERNAME = params.WEATHER_USERNAME;
            const PASSWORD = params.WEATHER_PASSWORD;
            const URL = params.WEATHER_URL;
            
            var city = params.conversation.context.city;
            var state = params.conversation.context.state;

            var latitude = city.states[state].latitude;
            var longitude = city.states[state].longitude;
            const range = "7day";
            const method = "/v1/geocode/";
            const URL = URL + method + latitude + '/' + longitude + '/' + 'forecast/daily/' + range + '.json' || params.WEATHER_URL + method + latitude + '/' + longitude + '/' + 'forecast/daily/' + range + '.json'

            request({
                method: 'GET',
                url: URL,
                auth: {
                    username: USERNAME,
                    password: PASSWORD,
                    sendImmediately: true
                },
                jar: true,
                json: true,
                qs: {
                    units: 'e',
                    language: 'en-US'
                }
            }, function (error, response, body) {
                var weather_conditions = {};

                for (var i = 0; i < body.forecasts.length; i++) {
                    var forecastDetail = body.forecasts[i];
                    // check if there are daytime forecasts available
                    if (forecastDetail.hasOwnProperty("day")) {
                        weather_conditions[forecastDetail.dow] = {
                            fullNarrative: forecastDetail.narrative,
                            day: {
                                temp: forecastDetail.day.temp,
                                pop: forecastDetail.day.pop,
                                uv_index: forecastDetail.day.uv_index,
                                narrative: forecastDetail.day.narrative,
                                phrase_12char: forecastDetail.day.phrase_12char,
                                phrase_22char: forecastDetail.day.phrase_22char,
                                phrase_32char: forecastDetail.day.phrase_32char
                            },
                            night: {
                                temp: forecastDetail.night.temp,
                                pop: forecastDetail.night.pop,
                                uv_index: forecastDetail.night.uv_index,
                                narrative: forecastDetail.night.narrative,
                                phrase_12char: forecastDetail.night.phrase_12char,
                                phrase_22char: forecastDetail.night.phrase_22char,
                                phrase_32char: forecastDetail.night.phrase_32char
                            }
                        }
                    } 
                    else {
                        weather_conditions[forecastDetail.dow] = {
                            fullNarrative: forecastDetail.narrative,
                            night: {
                                temp: forecastDetail.night.temp,
                                pop: forecastDetail.night.pop,
                                uv_index: forecastDetail.night.uv_index,
                                narrative: forecastDetail.night.narrative,
                                phrase_12char: forecastDetail.night.phrase_12char,
                                phrase_22char: forecastDetail.night.phrase_22char,
                                phrase_32char: forecastDetail.night.phrase_32char
                            }
                        }
                    }
                }
                
                if (error || response.statusCode != 200) {
                    reject(error);
                } else {
                    var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
                    if (!params.conversation.context.hasOwnProperty("weather_conditions")) {
                        console.log('adding weather property');
                        output.conversation.context.weather_conditions = weather_conditions; 
                    }
                    resolve(output);
                }
            });
        });
    }
}
