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
        delete params.WEATHER_USERNAME;
        delete params.WEATHER_PASSWORD;
        delete params.WEATHER_URL;
        if (params.__ow_method) {
            delete params.__ow_method;
            delete params.__ow_headers;
            delete params.__ow_path;
        }
        return params;
    } else {
        return new Promise(function(resolve, reject) {
            const request = require('request');
            
            var USERNAME = params.WEATHER_USERNAME;
            var PASSWORD = params.WEATHER_PASSWORD;
            var URL = params.WEATHER_URL;
            
            var city = params.conversation.context.city;
            console.log(city);
            var state = params.conversation.context.state;
            console.log(state);
            
            var latitude = city.states[state].latitude;
            console.log(latitude);
            var longitude = city.states[state].longitude;
            console.log(longitude);
            var range = "7day";
            var method = "/v1/geocode/";
            var URL = URL + method + latitude + '/' + longitude + '/' + 'forecast/daily/' + range + '.json' || params.WEATHER_URL + method + latitude + '/' + longitude + '/' + 'forecast/daily/' + range + '.json'

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
                console.log(response.statusCode);
                
                var forecastList = [];
                var weather_conditions = {};

                for (var i = 0; i < body.forecasts.length; i++) {
                    var forecastDetail = body.forecasts[i];
                    // check if there are daytime forecasts available
                    if (forecastDetail.hasOwnProperty("day")) {
                        var forecast = {
                            [forecastDetail.dow]: {
                                fullNarrative: forecastDetail.narrative,
                                day: {
                                    dayNarrative: forecastDetail.day.narrative
                                },
                                night: {
                                    nightNarrative: forecastDetail.night.narrative
                                }
                            }
                        };
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
                        var forecast = {
                            [forecastDetail.dow]: {
                                fullNarrative: forecastDetail.narrative,
                                night: {
                                    nightNarrative: forecastDetail.night.narrative
                                }
                            }
                        };
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
                    forecastList[i] = forecast;
                    console.log(weather_conditions);
                }
                
                if (error || response.statusCode != 200) {
                    reject(error);
                } else {
                    if (!params.conversation.context.hasOwnProperty("weather_conditions")) {
                        console.log('adding weather property');
                        params.conversation.context.weather_conditions = weather_conditions; 
                    }
                    var output = Object.assign({}, params);
                    
                    delete output.WEATHER_USERNAME;
                    delete output.WEATHER_PASSWORD;
                    delete output.WEATHER_URL;
                    if (output.__ow_method) {
                        delete output.__ow_method;
                        delete output.__ow_headers;
                        delete output.__ow_path;
                    }
                    resolve(output);
                }
            });
        });
    }
}
