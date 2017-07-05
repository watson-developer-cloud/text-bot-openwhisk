console.log("doing weather");
/**
 * Calls the Weather API and returns the Weather for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.latitude The latitude of the city, if null this action doesn't do anything.
 * @param {String} params.longitude The longitude of the city, if null this action doesn't do anything.
 * @param {String} params.location.type The location type.
 */
function main(params) {
    if (!params || !params.message.context.location || !params.message.context.location.isCity || !params.message.context.conversation.context.state) {
        
        if (params.message.context.conversation.context.city && !params.message.context.conversation.context.city.states) {
            console.log("STATE DOESN'T EXIST");
            params.message.context.conversation.context.system.dialog_stack[0].dialog_node = "node_2_1471378528322";
            console.log(params.message.context.conversation.context.system.dialog_stack[0].dialog_node);
        }
        
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
            console.log("returning promise");
            const request = require('request');
            
            var USERNAME = params.WEATHER_USERNAME;
            var PASSWORD = params.WEATHER_PASSWORD;
            var URL = params.WEATHER_URL;
            
            var city = params.message.context.conversation.context.location.city;
            console.log(city);
            var state = params.message.context.conversation.context.state;
            console.log(state);
            console.log(params.message.context.location.geolocation.latitude);
            var latitude = params.message.context.location.geolocation.latitude;
            console.log(latitude);
            var longitude = params.message.context.location.geolocation.longitude;
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
                    if (!params.message.context.conversation.context.hasOwnProperty("weather_conditions")) {
                        console.log("adding weather property");
                        params.message.context.conversation.context.weather_conditions = weather_conditions; 
                    }
                    var output = Object.assign({}, params);
                    
                    //output.message.context.conversation = output.conversation;
                    
                    
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
