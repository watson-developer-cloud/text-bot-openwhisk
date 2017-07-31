/**
 * Calls the Conversation service and returns a conversation context.
 * @param {Object} params The parameters
 * @param {String} params.CONVERSATION_USERNAME The username for the Conversation service.
 * @param {String} params.CONVERSATION_PASSWORD The password for the Conversation service.
 * @param {Object} params.conversation The conversation object.
 * @param {Object} params.conversation.input The user's input message.
 */
const assert = require('assert');
const watson = require('watson-developer-cloud');
const  DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function main(params) {
  return new Promise(function (resolve, reject) {
    assert(params !== null, 'params can not be null');
    assert(params.CONVERSATION_USERNAME !== null, 'params.CONVERSATION_USERNAME can not be null');
    assert(params.CONVERSATION_PASSWORD !== null, 'params.CONVERSATION_PASSWORD can not be null');
    assert(params.conversation !== null && params.conversation.input !== null, 'params.conversation.input can not be null');

    const conversation = watson.conversation({
      username: params.CONVERSATION_USERNAME,
      password: params.CONVERSATION_PASSWORD,
      version: 'v1',
      version_date: '2017-05-26'
    });

    var context = (params.conversation && params.conversation.context ? params.conversation.context : {});

    if (!context.date) {
      const date = new Date();
      const today = DAYS_OF_WEEK[date.getDay()];
      context.date = today;
      context.today = today;
      const tomorrow = DAYS_OF_WEEK[date.getDay() + 1];
      context.tomorrow = tomorrow;
    }

    conversation.message({
      workspace_id: params.WORKSPACE_ID,
      input: params.conversation.input,
      context,
    }, function (err, response) {
      if (err) {
        return reject(err);
      }

      const output = Object.assign({}, {
        conversation: response
      });

      if (params._id) {
        output._id = params._id;
        output._rev = params._rev;
      }
      return resolve(output);
    });
  });
}

module.exports.main = main;
