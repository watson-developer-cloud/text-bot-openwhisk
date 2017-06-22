console.log("doing nlu");
function main(params) {
    console.log("calling nlu");
    return new Promise(function(resolve, reject) {
        var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
        var USERNAME = params.NLU_USERNAME;
        var PASSWORD = params.NLU_PASSWORD;
            
        var natural_language_understanding = new NaturalLanguageUnderstandingV1({
            username: USERNAME,
            password: PASSWORD,
            version_date: '2017-02-27'
        });
        console.log("validated credentials");
        var parameters = {
            text: params.message.input,
            language: 'en',
            features: {
                entities: {
                    limit: 1,
                    Location: params.message.input
                }
            }
        };
        console.log("defined params");
        console.log("input:" + parameters.text);

        console.log("analyzing nlu");
        natural_language_understanding.analyze(parameters, function(err, response) {
        console.log(response);
        console.log("response.entities");
        console.log(response.entities);
            if (err && parameters.text != "") {
                console.log("error");
                return reject(err);
            }
            else if (parameters.text === "" || response.entities.length === 0 || response.entities[0].type !== 'Location') {
                console.log("no text");
                var output = Object.assign({}, params, {location: {
                    city: "",
                    type: "",
                    isCity: false,
                    locationInfo: (location && location.length > 0 ? location[0] : null)}
                });
                return resolve(output);
            }
            else if (response.entities[0].disambiguation.subtype[0] === 'StateOrCounty' && params.location.city !== "") {
                var entry = params.geolocation.find(x => x.state === parameters.text) || params.geolocation.find(x => x.abbreviation === parameters.text);
                console.log("found state");
                console.log(entry);
                params.location.state = entry.state;
                params.conversation.context.city.states = {
                    [entry.state]: {
                        latitude: entry.coordinates.latitude,
                        longitude: entry.coordinates.longitude
                    }
                }
                params.conversation.context.state = entry.state;
                params.conversation.context.city.number_of_states = 1;
                params.location.geolocation = entry.coordinates;
            }
            else
                var entities = response.entities;
                var location = response.entities
                    .filter(e => e.type === 'Location');
                    
                if (location[0].disambiguation.subtype[0] === 'City' || location[0].disambiguation.subtype[0] === 'city') {
                    console.log("get city name");
                    var city_name = location[0].text;
                    console.log(city_name);
                    console.log("get disambiguation");
                    var location_type  = location[0].disambiguation.subtype[0];
                    console.log(location_type);
                    var isCity = (location[0].disambiguation.subtype[0] === 'City' || location[0].disambiguation.subtype[0] === 'city');
                    console.log(isCity);
                    // replace empty location field with new details of the detected city                                                  
                    params.location.city = city_name;
                    params.location.type = location_type.toLowerCase();
                    params.location.isCity = isCity;
                    params.location.locationInfo = (location && location.length > 0 ? location[0] : null);
                }
                else {
                    params.location.state = location[0].text;
                }
                

                var output = Object.assign({}, params);

                return resolve(output);
        });
    });
}
