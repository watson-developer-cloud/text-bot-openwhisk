const action = require('../../actions/getWeather');
const assert = require('assert');
const nock = require('nock');

const latitude = 42;
const longitude = 42;

describe('[action] getWeather', function () {

  beforeEach(function() {
    nock('https://twcservice.mybluemix.net')
      .get(`/api/weather/v1/geocode/${latitude}/${longitude}/forecast/daily/7day.json/`)
      .query({
        jar: true,
        hson: true,
        qs: {},
      })
      .reply(200, {
        forecasts: {}
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
      assert(error.message === 'params.WEATHER_USERNAME can not be null');
    });
  });

  it('should call getWeather when parameters are right', function () {
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
