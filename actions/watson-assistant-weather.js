/**
 * Calls the Watson Assistant (Conversation) service and returns a conversation context.
 * @param {Object} params The parameters
 * @param {String} params.WATSON_ASSISTANT_USERNAME The username for the Watson Assistant service.
 * @param {String} params.WATSON_ASSISTANT_PASSWORD The password for the Watson Assistant service.
 */
const assert = require('assert');
const watson = require('watson-developer-cloud');

function main(params) {
  return new Promise(function(resolve, reject) {
    assert(params, 'params can not be null');
    assert(params.WATSON_ASSISTANT_USERNAME, 'params.WATSON_ASSISTANT_USERNAME can not be null');
    assert(params.WATSON_ASSISTANT_PASSWORD, 'params.WATSON_ASSISTANT_PASSWORD can not be null');
    assert(params.conversation && params.conversation.context, 'params.conversation.context can not be null');

    var context = (params.conversation && params.conversation.context) ? params.conversation.context : {};

    if (!context.weather_conditions && !context.system.branch_exited) {
      var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
      resolve(output);
    } else {
      const conversation = watson.conversation({
        username: params.WATSON_ASSISTANT_USERNAME,
        password: params.WATSON_ASSISTANT_PASSWORD,
        version: 'v1',
        version_date: '2017-05-26'
      });

      conversation.message({
        workspace_id: params.WORKSPACE_ID,
        input: params.conversation.input,
        context: context
      }, function(err, response) {
        if (err) {
          return reject(err);
        }
        var output = params._id ? Object.assign({}, {conversation: params.conversation}, {_id: params._id}, {_rev: params._rev}) : Object.assign({}, {conversation: params.conversation});
        output.conversation = response;
        return resolve(output);
      });
    }
  });
}

module.exports.main = main;
