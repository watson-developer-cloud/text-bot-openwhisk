console.log("doing geoloc");
/**
 * Calls the Weather API and returns the Geolocation for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.conversation.city The conversation city parameter, if null this action doesn't do anything.
 * @param {String} params.conversation.city.name The city name.
 */
function main(params) {
    if (!params || !params.conversation.context.city.name || params.conversation.context.state) {
        console.log("No params");
        delete params.WEATHER_USERNAME;
        delete params.WEATHER_PASSWORD;
        delete params.WEATHER_URL;
        if (params.__ow_method) {
            delete params.__ow_method;
            delete params.__ow_headers;
            delete params.__ow_path;
        }
        return params;
    }else {
        console.log("There are params");
        return new Promise(function(resolve, reject) {
            const request = require('request');
            var method = "/v3/location/search"; 

            request({
                method: 'GET',
                url: params.WEATHER_URL + method,
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
            }, function (error, response, body) {
                console.log(response.statusCode);
                console.log(body);
                
                var latitudes = body.location.latitude;
                var longitudes = body.location.longitude;
                // map the latitude and longitude values to each other
                var coordinates = latitudes.map( (x, i) => {
                    return {"latitude": x, "longitude": longitudes[i]}        
                });
                
                var states = {}
                
                body.location.adminDistrict.forEach(function(state, i) {
                    states[state] = {
                        longitude: coordinates[i].longitude,
                        latitude: coordinates[i].latitude
                    };
                });
                
                var output = Object.assign({}, params);
                output.conversation.context.city.states = states;
                
                if (output.conversation.context.city.number_of_states === null) {
                    output.conversation.context.city.number_of_states = body.location.adminDistrict.length;
                    
                    if (output.conversation.context.city.number_of_states === 1) {
                        output.conversation.context.state = body.location.adminDistrict[0];
                    }
                }
                
                delete output.WEATHER_USERNAME;
                delete output.WEATHER_PASSWORD;
                delete output.WEATHER_URL;
                if (output.__ow_method) {
                    delete output.__ow_method;
                    delete output.__ow_headers;
                    delete output.__ow_path;
                }
                console.log(output);

                if (error || response.statusCode != 200) {
                    reject(error);
                } else {
                    resolve(output);
                }
            });
        });
    }
}
