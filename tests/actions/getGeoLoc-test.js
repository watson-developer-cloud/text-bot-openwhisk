const action = require('../../actions/getGeoLoc');
const assert = require('assert');
const nock = require('nock');

describe('[action] getGeoLoc', function () {

  beforeEach(function() {
    nock('https://twcservice.mybluemix.net')
      .get('/api/weather/v3/location/search')
      .query({
        query: 'City name'
      })
      .reply(200, {
        body: {}
      });
  });

  it('should throw error if credentials are missing', function () {
    const params = {
      conversation: {
        input: {},
        context: {
          city: {
            name: '',
            number_of_states: null,
            alternate_name: '',
            states: {}
          }
        }
      }
    };
    return action.main(params).then(function() {
      assert.fail('Missing credentials error was not found');
    }).catch(function(error) {
      assert(error.message === 'Argument error: username and password are required unless use_unauthenticated is set');
    });
  });

  it('should call getGeoLoc when parameters are right', function () {
    const params = {
      WEATHER_USERNAME: 'foo',
      WEATHER_PASSWORD: 'bar',
      WEATHER_URL: 'baz',
      conversation: {
        input: {
          text: 'Hello'
        },
        context: {
          city: {
            name: '',
            number_of_states: null,
            alternate_name: '',
            states: {}
          }
        },
      },
    };
    return action.main(params).then(function() {
      assert(true);
    }).catch(assert.ifError);
  });
});
