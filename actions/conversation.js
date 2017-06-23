/**
 * Calls the Conversation service and returns a conversation context.
 * @param {Object} params The parameters
 * @param {String} params.CONVERSATION_USERNAME The username for the Conversation service.
 * @param {String} params.CONVERSATION_PASSWORD The password for the Conversation service.
 */

console.log("doing conversation");
function main(params) {
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
        if (params.hasOwnProperty("geolocation") && params.geolocation.length > 1) {
            console.log("Too many options; Ask for state");
        }
        if (params.geolocation && params.geolocation.length == 1) {
            console.log("one state");
            var entry = params.geolocation.find(x => x.city === params.location.city);
            console.log("found state");
            console.log(entry);
            params.location.state = entry.state;
            console.log(entry.state);
            params.conversation.context.city = {
                name: entry.city,
                alternate_name: entry.city
            }
            params.conversation.context.city.states = {
                [entry.state]: {
                    latitude: entry.coordinates.latitude,
                    longitude: entry.coordinates.longitude
                }
            }
            console.log(params.conversation.context.city.states);
            params.conversation.context.state = entry.state;
            params.conversation.context.city.number_of_states = 1;
            params.location.geolocation = entry.coordinates;
            console.log("done");
        }
        console.log("checking if context is empty");
        console.log(params.message.context);
        console.log("debug");
        //console.log(params.conversation.context.weather_conditions.get(Monday).day);
        
        var city_name;
        var state_name;
        var coordinates;
        
        if (params.location.isCity && params.hasOwnProperty("conversation") && params.conversation.context != {}) {   
            console.log("context is not empty");
            city_name = params.location.city;
            console.log(city_name);
            state_name = (params.conversation.context.state !== null ? params.conversation.context.state : "");
            console.log(state_name);
            coordinates = (params.location.geolocation !== null ? params.location.geolocation : {});
            console.log(' ');
        }
        else {
            city_name = "";
            state_name = "";
        }
        var text = (city_name != "" ? city_name : params.message.input);
        console.log(text);
        
        
        var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        var date = new Date();
        var today = daysOfWeek[date.getDay()-1];
        var tomorrow = daysOfWeek[date.getDay()];
        console.log(daysOfWeek[date.getDay()-1]);
        
        var context = (params.hasOwnProperty("conversation") && params.conversation.context != {} ? params.conversation.context : params.message.context);
        console.log(context);
        if (!context.hasOwnProperty("date")) {
            context.date = today;
            context.today = today;
            context.tomorrow = tomorrow;
            console.log("added date");
            console.log(context);
        }
        if (params.location.isCity == true && (!context.hasOwnProperty("city") || !context.hasOwnProperty("state"))) {
            context.city = {
                name: city_name,
                geolocation: params.location.coordinates,
                number_of_states: params.geolocation.length,
                alternate_name: city_name
            };
            console.log("added city");
            console.log(context);
        }

        conversation.message({
            workspace_id: WORKSPACE_ID,
            input: {text: text/*, language: 'english'*/},
            context: context//(params.hasOwnProperty("conversation") && params.conversation.context != {} ? params.conversation.context : params.message.context)
        }, function(err, response) {
                if (err) {
                    return reject(err);
                }
                console.log("no error");
                
                var output = Object.assign({}, params, {conversation: response });
                console.log(JSON.stringify(output))
                return resolve(output);
        });
    });
}
