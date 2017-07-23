console.log('getting geolocation');
/**
 * Calls the Weather API and returns the Geolocation for a given city.
 * @param {Object} params The parameters
 * @param {Object} params.conversation.city The conversation city parameter, if null this action doesn't do anything.
 * @param {String} params.conversation.city.name The city name.
 */
function main(params) {
    if (!params || !params.conversation.context.city.name || params.conversation.context.state) {
        console.log('No needed params');
        var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
        return output;

    } else {
        console.log('There are params');
        return new Promise(function(resolve, reject) {
            const request = require('request');
            const method = "/v3/location/search";
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
            }, function (error, response, body) {
                console.log(body);

                var latitudes = body.location.latitude;
                var longitudes = body.location.longitude;
                var abbrList = body.location.adminDistrictCode;
                var statesList = body.location.adminDistrict;
                // map the latitude and longitude values to each other
                var coordinates = latitudes.map( (x, i) => {
                    return {"latitude": x, "longitude": longitudes[i]}
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
                    }
                })

                var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
                output.conversation.context.city.states = states;
                output.conversation.context.abbreviations = abbreviations;

                if (params.conversation.context.city.number_of_states === null) {
                    console.log('num of states null');
                    output.conversation.context.city.number_of_states = body.location.adminDistrict.length;

                    if (params.conversation.context.city.number_of_states === 1) {
                        output.conversation.context.state = body.location.adminDistrict[0];
                    }
                }

                if (error || response.statusCode != 200) {
                    console.log('error');
                    reject(error);
                } else {
                    console.log('no error');
                    resolve(output);
                }
            });
        });
    }
}
