import React, { Component } from 'react';
import { Header, Footer, TextInput, Colors } from 'watson-react-components/dist/components';
import uuidv1 from 'uuid/v1';
import './App.css';

var env = require('./env.json');

const OPENWHISK_BACKEND = env.OPENWHISK_BACKEND;
const IBM_KEY = env.IBM_KEY;

const Timestamp = require('react-timestamp');

const Message = (props) => (
  <div className="segments load">
    <div className={`${props.type === 'user' ? 'from-user' : 'from-watson'} top`}>
      <div className="summary">{props.summary}</div>
      <div className="message-inner">
        <p>{props.message}</p>
      </div>
      <div className="time">{props.time}</div>
    </div>
  </div>
);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      context: {},
      messages: [],
      sender: 'watson'/*,
      _id: uuidv1()*/
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  sendMessage(input, context) {
    const self = this;
    fetch(OPENWHISK_BACKEND, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-IBM-Client-Key': IBM_KEY,
      },
      body: JSON.stringify({ conversation: { input: { text: input, language: 'en' }, context: context/*, _id: self.state._id */} })
    })
      .then(response => response.json())
      .then(function(messageResponse) {
        console.log(`Text: ${messageResponse.conversation.input.text}`);
        console.log(`Response: ${messageResponse}`);
        let now = new Date();
        let hhmmss = now.toString().substr(4, 20);
        console.log(now);

        self.setState({
          context: messageResponse.conversation.context,
          messages: self.state.messages.concat({
            message: messageResponse.conversation.output.text.join('\n'),
            type: 'watson',
            time: hhmmss,
            summary: messageResponse.conversation.context.summary
          })});
      })
      .catch(error => {
        self.setState({ error });
      });
  }

  handleKeyPress(event) {
    if(event.key === 'Enter') {
      console.log(this.state.text);
      console.log(this.state.context);
      this.sendMessage(this.state.text, this.state.context);
      event.target.value = '';
      let now = new Date();
      let hhmmss = now.toString().substr(4, 20);


      this.setState({
        context: '',
        messages: this.state.messages.concat({
          message: this.state.text,
          type: 'user',
          time: hhmmss,
          summary: 'from user'
        })});
    }
  }

  componentDidMount() {
    this.sendMessage('Hello', {});
  }

  render() {

    return (
      <div className="App">
        <Header
          mainBreadcrumbs="Weather Bot with OpenWhisk"
          mainBreadcrumbsUrl=""
          color={Colors.gray_90}
          hasWordmark={false}
        />

        <div id="chat-column-holder" className="responsive-column content-column">
          <div className="chat-column">
            <div id="scrollingChat" className="scrollingChat">
              {!this.state.error ? JSON.stringify(this.state.error) : null}
              {!this.state.error ? this.state.messages.map(m => <Message type={m.type} message={m.message} time={m.time} summary={m.summary} />) : null}
            </div>
          </div>
        </div>

        <TextInput
          id="text-input-1"
          placeholder="Type here"
          onInput={(e) => {
            this.setState({ text: e.target.value });
          }}
          onKeyPress={this.handleKeyPress}
        />
      </div>
    );
  }
}

export default App;
