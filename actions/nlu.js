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
            text: params.conversation.input.text,
            language: 'en',
            features: {
                entities: {
                    limit: 1,
                    Location: params.conversation.input.text
                }
            }
        };

        console.log("analyzing nlu");
        natural_language_understanding.analyze(parameters, function(err, response) {
            if (err && parameters.text != "") {
                console.log("error");
                return reject(err);
            }
            else if (parameters.text === "" || response.entities.length === 0 || response.entities[0].type !== 'Location') {
                console.log("no city");
                var output = Object.assign({}, params);
                    
                output.conversation.context.city = {
                    name: "",
                    number_of_states: null,
                    alternate_name: "",
                    states: {}
                }
                
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
            else if (response.entities[0].disambiguation.subtype[0] === 'StateOrCounty' && params.conversation.context.city.name) {
                var state = params.conversation.input.text;
                
                if (!params.conversation.context.city.states[state]) {
                    return reject(err);
                }
                params.conversation.context.state = state;
                console.log("found state");
                console.log(state);
                
                params.conversation.context.city.states = {
                    [state]: {
                        longitude: params.conversation.context.city.states[state].longitude,
                        latitude: params.conversation.context.city.states[state].latitude
                    }
                }
                params.conversation.context.city.number_of_states = 1;
            }
            else {
                var location = response.entities
                    .filter(e => e.type === 'Location');
                    
                if (location[0].disambiguation.subtype[0] === 'City' || location[0].disambiguation.subtype[0] === 'city') {
                    console.log("get city name");
                    var city_name = location[0].text;
                    console.log(city_name);
                    console.log("get disambiguation");
                    var location_type = location[0].disambiguation.subtype[0];
                    console.log(location_type);
                    var isCity = (location[0].disambiguation.subtype[0] === 'City' || location[0].disambiguation.subtype[0] === 'city');
                    console.log(isCity);
                    // replace empty location field with new details of the detected city                                                  
                    params.conversation.context.city.name = city_name;
                    params.conversation.context.city.alternate_name = city_name;
                    params.conversation.context.state = "";
                }
            }
    
            var output = Object.assign({}, params);

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
