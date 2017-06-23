# Watson Weather Chat Bot using OpenWhisk

This project gives you the current weather forecast for your city (U.S. only as of now). The Weather Bot is based off the [Watson Weather Bot](https://github.com/watson-developer-cloud/text-bot) and uses Conversation, Natural Language Understanding, and The Weather Company Data API. It is run with [OpenWhisk](https://console.bluemix.net/openwhisk/).

To see a list of IBM Services, visit here: https://console.bluemix.net/catalog/

## Getting Started

### Setting up Bluemix and Watson Services

1. If you do not already have an existing IBM Bluemix account, sign up [here](https://bluemix.net/).
2. Clone this repository and go to the cloned directory.
   ```none
   git clone https://github.com/eakelly/openwhisk-textbot.git
   cd path/openwhisk-textbot
   ```
3. Download and install the [Cloud-Foundry CLI](https://github.com/cloudfoundry/cli).
   * Alternatively, you can create the necessary services by going to your [Bluemix dashboard](https://console.bluemix.net/dashboard/).
4. Once the CLI has been set up and the repo has been cloned, open a terminal window and connect to Bluemix by doing the following:
   ```none
   cf api https://api.ng.bluemix.net
   cf login
   ```
5. Follow the steps in the README [here](https://github.com/watson-developer-cloud/text-bot) to set up the Conversation, NLU, and Weather Company Data services on Bluemix.

### OpenWhisk Setup

1. Download and install the [OpenWhisk CLI](https://console.bluemix.net/openwhisk/learn/cli), then follow the steps on that page to set up your OpenWhisk Namespace and Authorization Key.

2. You will be creating 4 actions (not including actions for the Cloudant DB) for the weather chat bot as follows:
   ```none
   wsk action create conversation actions/conversation.js --web true
   wsk action create nlu actions/nlu.js --web true
   wsk action create getGeoLoc actions/getGeoLoc.js --web true
   wsk action create getWeather actions/getWeather.js --web true
   ```
3. Change to the config directory and Replace the default parameters with your Watson service credentials. Your credentials can be found by heading to your [dashboard](https://console.bluemix.net/dashboard/apps), clicking on the service name, and then the Service Credentials tab.
   * Conversation Credentials
   ```none
   {
    "CONVERSATION_USERNAME": "<YOUR CONVERSATION SERVICE USERNAME>",
    "CONVERSATION_PASSWORD": "<YOUR CONVERSATION SERVICE PASSWORD>",
    "WORKSPACE_ID": "<YOUR CONVERSATION SERVICE WORKSPACE_ID>"
   }
   ```
   Your workspace ID can be found by going to your [dashboard](https://console.bluemix.net/dashboard/apps), clicking on your Conversation service,
   then clicking on the Launch Tool button.

   * NLU Credentials
   ```none
   {
    "NLU_USERNAME": "<YOUR NLU SERVICE USERNAME>",
    "NLU_PASSWORD": "<YOUR NLU SERVICE PASSWORD>"
   }
   ```
   * Weather Company Data Credentials
   ```none
   {
    "WEATHER_URL": "<YOUR WEATHER SERVICE URL>",
    "WEATHER_USERNAME": "<YOUR WEATHER SERVICE USERNAME>",
    "WEATHER_PASSWORD": "<YOUR WEATHER NSERVICE PASSWORD>"
   }
   ```
4. Export your service credentials by performing the following:
   ```none
   wsk action update conversation --param-file config/conversation-config.json
   wsk action update nlu --param-file config/nlu-config.json
   wsk action update getGeoLoc --param-file config/weather-config.json
   wsk action update getWeather --param-file config/weather-config.json
   ```
5. Finally, create an OpenWhisk sequence to connect the actions:
   ```none
   wsk action create <sequence name> --sequence nlu,getGeoLoc,conversation,getWeather,conversation
   ```

## Running the sequence

Parameters for the sequence can be found in the parameters folder. Since there is no Cloudant DB implemented as of yet, these parameter files do the job of initializing the Conversation context, saving it accross the sequence, and using it to output the weather to the user.

1. To initialize the Conversation context, and begin the chat bot service, run the following:

   ```none
   wsk action invoke --result <sequence name> --param-file textbot-init.json
   ```
This will produce an initial context that will be used in the next execution of the sequence.

2. Next, you can choose whether to input a city name that applies to only one state or that applies to many states.
### For a city name that applies to only one state:
1. Edit the textbot-city.json file to include the city name of your choice.
   ```none
   "message": {
       "context": {
           "date": "Thursday",
           "today": "Thursday",
           "tomorrow": "Friday"
       },
       "input": "Chicopee" <====== This is where the city name goes
    }
    ```
2. Save this file and then execute the sequence once more with:
   ```none
    wsk action invoke --result <sequence name> --param-file textbot-city.json
    ```
3. On your terminal window, look for the field that says "output" as this will contain your weather forcast for that city.

### For a city name that exists in multiple U.S. states:
1. Edit the textbot-multipleStates.json file to include the city name of your choice.
   ```none
   "message": {
       "context": {
           "date": "Thursday",
           "today": "Thursday",
           "tomorrow": "Friday"
       },
       "input": "Austin" <======= This is where the city name goes
   }
   ```
2. Save this file and then execute the sequence with that parameter file.
   ```none
   wsk action invoke --result <sequence name> --param-file textbot-multipleStates.json
   ```
3. Copy the terminal window output from that sequence and paste it into the textbot-state.json file.
4. Change the following field to include the name of the state for the city you are querying:
   ```none
   "message": {
       "context": {
           "date": "Thursday",
           "today": "Thursday",
           "tomorrow": "Friday"
       },
       "input": "Texas" <======= This is where the state name goes
   }
   ```
5. Execute the sequence once more with this file:
   ```none
   wsk action invoke --result <sequence name> --param-file textbot-state.json
   ```
6. Look for the field that says "output" on your terminal window to see the weather forecast for your city.

## Future Updates
* Cloudant DB integration and the creation of actions to get and store information within the database
* Ability to query a certain day within the 7-day forecast for your city
* Build a UI
* Output a list of states for the user to choose from should a city name occur in more than one state
* Improve city detection accuracy