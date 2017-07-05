console.log("doing geoloc");
/**
 * Calls the Weather API and returns the Geolocation for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.location The location parameters, if null this action doesn't do anything.
 * @param {String} params.location.city The city name.
 * @param {String} params.location.type The location type.
 */
function main(params) {
    if (!params || !params.message.context.location || !params.message.context.location.isCity || params.message.context.location.state) {
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
                    query: params.message.context.location.city,
                    locationType: params.message.context.location.type,
                    countryCode: 'US',
                    language: 'en-US'
                }
            }, function (error, response, body) {
                console.log(response.statusCode);
                console.log(body);
                
                var states = body.location.adminDistrict;
                //console.log(states);
                
                var state_abbreviations = body.location.adminDistrictCode;
                //console.log(state_abbreviations);
                
                var cities = body.location.city;
                //console.log(cities);
                
                var countries = body.location.country;
                //console.log(countries);
                
                var latitudes = body.location.latitude;
                var longitudes = body.location.longitude;
                // map the latitude and longitude values to each other
                var coordinates = latitudes.map( (x, i) => {
                    return {"latitude": x, "longitude": longitudes[i]}        
                });
                //console.log(coordinates);
                
                var city_states = cities.map( (x, i) => {
                    return {"city": x, "state": states[i], "abbreviation": state_abbreviations[i], "country": countries[i], "coordinates": coordinates[i]}        
                });
                console.log("Mapped cities");
                console.log(city_states);
                console.log("***testing map***");
                console.log(city_states[0].abbreviation);
                
                var output = Object.assign({}, params);
                output.message.context.geolocation = city_states;
                
                if (output.message.context.conversation.context.city && output.message.context.conversation.context.city.states) {
                    console.log("STATE EXISTS");
                    output.message.context.conversation.context.system.dialog_stack[0].dialog_node = "node_1_1471971854852";
                    console.log(output.message.context.conversation.context.system.dialog_stack[0].dialog_node);
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
