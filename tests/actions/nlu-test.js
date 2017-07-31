const action = require('../../actions/nlu');
const assert = require('assert');
const nock = require('nock');

describe('[action] NLU', function () {

  beforeEach(function() {
    nock('https://gateway.watsonplatform.net:443')
      .post('/natural-language-understanding/api/v1/analyze')
      .query({
        version:'2017-02-27'
      })
      .reply(200, {
        entities: []
      });
  });

  it('should throw error if credentials are missing', function () {
    const params = {
      conversation: { input: {} }
    };
    return action.main(params).then(function() {
      assert.fail('Missing credentials error was not found');
    }).catch(function(error) {
      assert(error.message === 'params.NLU_USERNAME can not be null');
    });
  });

  it('should call nlu when parameters are right', function () {
    const params = {
      NLU_USERNAME: 'foo',
      NLU_PASSWORD: 'bar',
      conversation: {
        input: {
          text: 'Hello'
        },
        context: {},
      },
    };
    return action.main(params).then(function() {
      assert(true);
    }).catch(assert.ifError);
  });
});
