/**                                                                                                                                   
 * Calls the Conversation service and returns a conversation context.                                                                 
 * @param {Object} params The parameters                                                                                              
 * @param {String} params.CONVERSATION_USERNAME The username for the Conversation service.                                            
 * @param {String} params.CONVERSATION_PASSWORD The password for the Conversation service.                                            
 */
console.log("doing conversation");
function main(params) {
    //console.log(params.message.context.conversation.intents);
    console.log("calling conversation");
    return new Promise(function(resolve, reject) {
        var watson = require('watson-developer-cloud');
        var USERNAME = params.CONVERSATION_USERNAME;
        var PASSWORD = params.CONVERSATION_PASSWORD;
        var WORKSPACE_ID = params.WORKSPACE_ID;

        var conversation = watson.conversation({
            username: USERNAME,
            password: PASSWORD,
            version: 'v1',
            version_date: '2017-05-26'
        });
        //check
        console.log("checking for number of states");
        if (params.message.context.geolocation && params.message.context.geolocation.length === 1) {
            console.log("one state");
            var entry = params.message.context.geolocation.find(x => x.city === params.message.context.location.city);
            console.log("found state");
            console.log(entry);
            params.message.context.location.state = entry.state;
            console.log(entry.state);
            params.message.context.conversation.context.city = {
                name: entry.city,
                alternate_name: entry.city
            }
            params.message.context.conversation.context.city.states = {
                [entry.state]: {
                    latitude: entry.coordinates.latitude,
                    longitude: entry.coordinates.longitude
                }
            }
            console.log(params.message.context.conversation.context.city.states);
            params.message.context.conversation.context.state = entry.state;
            params.message.context.conversation.context.city.number_of_states = 1;
            params.message.context.location.geolocation = entry.coordinates;
            console.log("done");
        }

        var city_name;
        var state_name;
        var coordinates;
        
        if (params.message.context.location.isCity && params.message.context.hasOwnProperty("conversation") && params.message.context.conversation.context) {   
            console.log("context is not empty");
            city_name = params.message.context.location.city;
            console.log(city_name);
            state_name = (params.message.context.conversation.context.state !== null ? params.message.context.conversation.context.state : "");
            console.log(state_name);
            coordinates = (params.message.context.location.geolocation !== null ? params.message.context.location.geolocation : {});
            console.log(' ');
        }
        else {
            console.log("city and state are empty");
            city_name = "";
            state_name = "";
        }
        var text = (city_name != "" ? city_name : params.message.input);
        console.log(text);
        
        var context = (params.message.context.hasOwnProperty("conversation") && params.message.context.conversation.context !== {} ? params.message.context.conversation.context : params.message.context);

        var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var date = new Date();
        console.log(date);
        var today = daysOfWeek[date.getDay()];
        context.date = today;
        context.today = today;
        console.log(today);
        //var tomorrow = daysOfWeek[date.getDay()+1];
        //context.tomorrow = tomorrow;

        console.log("added date");

        if (params.message.context.location.isCity == true && !context.hasOwnProperty("city")) {
            console.log("coordinates");
            console.log(params.message.context.location.coordinates);
            context.city = {
                name: city_name,
                geolocation: params.message.context.location.coordinates,
                number_of_states: params.message.context.geolocation.length,
                alternate_name: city_name
            };
            console.log("added city");
        }
        console.log("CONTEXT");
        console.log(context);
        
        conversation.message({
            workspace_id: WORKSPACE_ID,
            input: {text: text, language: 'en'},
            context: context
        }, function(err, response) {
                if (err) {
                    return reject(err);
                }
                console.log("no error");
                
                var output = Object.assign({}, params);
                console.log("OUTPUT");
                console.log(output);
                output.message.context.conversation = response;
                console.log("RESPONSE");
                console.log(response);
                
                
                delete output.CONVERSATION_USERNAME;
                delete output.CONVERSATION_PASSWORD;
                delete output.WORKSPACE_ID;
                if (output.__ow_method) {
                    delete output.__ow_method;
                    delete output.__ow_headers;
                    delete output.__ow_path;
                }
                console.log(JSON.stringify(output))
                return resolve(output);
        });
    });
}
