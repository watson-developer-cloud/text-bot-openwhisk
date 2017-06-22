console.log("doing geoloc");
/**
 * Calls the Weather API and returns the Geolocation for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.location The location parameters, if null this action doesn't do anything.
 * @param {String} params.location.city The city name.
 * @param {String} params.location.type The location type.
 */
function main(params) {
    if (!params || !params.location || !params.location.isCity || params.location.state) {
        return params;
    }else {
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
                    query: params.location.city,
                    locationType: params.location.type,
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
                
                var output = Object.assign({}, params, {geolocation: city_states});

                if (error || response.statusCode != 200) {
                    reject(error);
                } else {
                    resolve(output);
                }
            });
        });
    }
}
