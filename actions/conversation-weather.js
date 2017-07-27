/**                                                                                                                                   
 * Calls the Conversation service and returns a conversation context.                                                                 
 * @param {Object} params The parameters                                                                                              
 * @param {String} params.CONVERSATION_USERNAME The username for the Conversation service.                                            
 * @param {String} params.CONVERSATION_PASSWORD The password for the Conversation service.                                            
 */
console.log('starting conversation');
function main(params) {
  console.log('calling conversation');
  var context = params.conversation.context;
  if (!context.weather_conditions && !context.system.branch_exited) {
    console.log('returning params');
    var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
    return output;
  }
  return new Promise(function(resolve, reject) {
    const watson = require('watson-developer-cloud');
    const USERNAME = params.CONVERSATION_USERNAME;
    const PASSWORD = params.CONVERSATION_PASSWORD;
    const WORKSPACE_ID = params.WORKSPACE_ID;

    const conversation = watson.conversation({
      username: USERNAME,
      password: PASSWORD,
      version: 'v1',
      version_date: '2017-05-26'
    });

    var city_name = params.conversation.context.city.name;
    var context = (params.conversation && params.conversation.context ? params.conversation.context : {});
        
    conversation.message({
      workspace_id: WORKSPACE_ID,
      input: params.conversation.input,
      context: context
    }, function(err, response) {
      if (err) {
        return reject(err);
      }
      console.log('no error');
      var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
      output.conversation = response;
      return resolve(output);
    });
  });
}
