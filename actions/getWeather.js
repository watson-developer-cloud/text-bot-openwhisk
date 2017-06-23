console.log("doing weather");
/**
 * Calls the Weather API and returns the Weather for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.latitude The latitude of the city, if null this action doesn't do anything.
 * @param {String} params.longitude The longitude of the city, if null this action doesn't do anything.
 * @param {String} params.location.type The location type.
 */
function main(params) {
    if (!params || !params.location || !params.location.isCity || !params.conversation.context.state) {
        return params;
    } else {
        return new Promise(function(resolve, reject) {
            console.log("returning promise");
            const request = require('request');
            
            var USERNAME = params.WEATHER_USERNAME;
            var PASSWORD = params.WEATHER_PASSWORD;
            var URL = params.WEATHER_URL;
            
            var city = params.location.city;
            var state = params.location.state;
            var latitude = params.location.geolocation.latitude;
            var longitude = params.location.geolocation.longitude;
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
                        console.log("adding weather property");
                        params.conversation.context.weather_conditions = weather_conditions; 
                    }
                    var output = Object.assign({}, params, {forecasts: forecastList});
                    resolve(output);
                }
            });
        });
    }
}
