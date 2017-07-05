/**                                                                                                                                   
 * Calls the Natural Language Understanding service and returns a location type and disambiguation.                                   
 * @param {Object} params The parameters                                                                                              
 * @param {String} params.NLU_USERNAME The username for the NLU service.                                                              
 * @param {String} params.NLU_PASSWORD The password for the NLU service.                                                              
 */
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
            if (err && parameters.text != "") {
                console.log("error");
                return reject(err);
            }
            else if (parameters.text === "" || response.entities.length === 0 || response.entities[0].type !== 'Location') {
                console.log("no text");
                var output = Object.assign({}, params);
                output.message.context.location = {
                    city: "",
                    type: "",
                    isCity: false,
                    locationInfo: (location && location.length > 0 ? location[0] : null)};
                
                delete output.NLU_USERNAME;
                delete output.NLU_PASSWORD;
                if (output.__ow_method) {
                    delete output.__ow_method;
                    delete output.__ow_headers;
                    delete output.__ow_path;
                }
                console.log(output);
                return resolve(output);
            }
            else if (response.entities[0].disambiguation.subtype[0] === 'StateOrCounty' && params.message.context.location.city !== "") {
                var entry = params.message.context.geolocation.find(x => x.state === parameters.text) || params.message.context.geolocation.find(x => x.abbreviation === parameters.text);
                console.log("found state");
                console.log(entry);
                params.message.context.conversation.context.state = entry.state;
                params.message.context.conversation.context.city.states = {
                    [entry.state]: {
                        latitude: entry.coordinates.latitude,
                        longitude: entry.coordinates.longitude
                    }
                }
                params.message.context.state = entry.state;
                
                params.message.context.location.geolocation = entry.coordinates;
                console.log("=========");
                console.log(params.message.context.conversation.context.state);
                params.message.context.conversation.context.city.number_of_states = 1;
                delete params.message.context.geolocation;
            }
            else {
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
                    params.message.context.location.city = city_name;
                    console.log("==============");
                    console.log(params.message.context.location.city);
                    params.message.context.location.type = location_type.toLowerCase();
                    params.message.context.location.isCity = isCity;
                    params.message.context.location.locationInfo = (location && location.length > 0 ? location[0] : null);
                    console.log(params.message.context.location);
                    params.message.context.conversation.context.location = params.message.context.location;
                    params.message.context.conversation.context.state = "";
                } else {
                    params.location.state = locatoin[0].text;
                }
            }
                
                
            var output = Object.assign({}, params);
            console.log("********************");

            delete output.NLU_USERNAME;
            delete output.NLU_PASSWORD;
            if (output.__ow_method) {
                delete output.__ow_method;
                delete output.__ow_headers;
                delete output.__ow_path;
            }
            console.log(output);

            return resolve(output);
        });
    });
}
