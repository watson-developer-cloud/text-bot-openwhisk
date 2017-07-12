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
        
        var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var stateTypes = ['StateOrCounty', 'AdministrativeDivision'];

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
            console.log(response);
            console.log('checking');
            console.log(parameters.text);
            if (err && parameters.text !== "") {
                console.log("error");
                console.log(err);
                return reject(err);
            }
            else if (parameters.text === "" || parameters.text === "Hello" /*response.entities.length === 0*/ || (response.entities.type && response.entities[0].type !== 'Location') && !params.conversation.context.city) {
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
            else if (daysOfWeek.indexOf(parameters.text) >= 0) {
                console.log('detected day');
                params.conversation.context.date = parameters.text;
                params.conversation.context.today = parameters.text;
                // to determine if the day of the week for tomorrow falls at the end of the week
                var tomorrow = (daysOfWeek.indexOf(parameters.text) < daysOfWeek.length-2 ? daysOfWeek.indexOf(parameters.text) + 1 : 0);
                params.conversation.context.tomorrow = daysOfWeek[tomorrow];
            }
            else if (response.entities.length > 0 && response.entities[0].disambiguation.subtype[0] === 'City') {
                console.log('detected city');
                var location = response.entities
                    .filter(e => e.type === 'Location');
                    
                console.log("get city name");
                var city_name = location[0].text;
                console.log(city_name);

                if (params.conversation.context.city.name !== parameters.text && params.conversation.context.weather_conditions) {
                    console.log("new city");
                    delete params.conversation.context.weather_conditions;
                    params.conversation.context.city.states = {};
                    params.conversation.context.city.number_of_states = null;
                }

                // replace empty location field with new details of the detected city                                                  
                params.conversation.context.city.name = city_name;
                params.conversation.context.city.alternate_name = city_name;
                params.conversation.context.state = "";
            }
            else if ((params.conversation.context.abbreviations[parameters.text] || (response.entities.length > 0 && stateTypes.indexOf(response.entities[0].disambiguation.subtype[0]) >= 0) || params.conversation.context.city.states[parameters.text]) && params.conversation.context.city.name) {
                console.log('detected state');
                var state = params.conversation.context.abbreviations[parameters.text] ? params.conversation.context.abbreviations[parameters.text].full : params.conversation.input.text;
                params.conversation.context.state = state;
                console.log('found state');
                console.log(state);

                params.conversation.context.city.states = {
                    [state]: {
                        longitude: params.conversation.context.city.states[state].longitude,
                        latitude: params.conversation.context.city.states[state].latitude
                    }
                }
                params.conversation.context.city.number_of_states = 1;
                params.conversation.context.abbreviations = {};
                
            }
            var output = Object.assign({}, params);

            delete output.NLU_USERNAME;
            delete output.NLU_PASSWORD;
            if (output.__ow_method) {
                delete output.__ow_method;
                delete output.__ow_headers;
                delete output.__ow_path;
            }
            console.log('done');
            console.log(output);

            return resolve(output);
        });
    });
}
