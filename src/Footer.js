import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="_full-width-row bottom-nav-bar footer">
    <div className="_container">
      <div className="bottom-nav-bar--row bottom-nav-bar--row_1">
        <a href="https://www.ibm.com/watson/developercloud/" className="base--a bottom-nav-bar--nav-link" target="_blank">Built with IBM Watson</a>
        <a href="http://www.ibm.com/watson/developercloud/conversation.html" className="base--a bottom-nav-bar--nav-link" target="_blank">Conversational API</a>
      </div>
      <div className="bottom-nav-bar--row bottom-nav-bar--row_2">
        <a href="#" className="base--a bottom-nav-bar--nav-link" target="_blank">ibm.com</a>
        <a href="#" className="base--a bottom-nav-bar--nav-link" target="_blank">Terms of Use</a>
        <a href="#" className="base--a bottom-nav-bar--nav-link" target="_blank">Privacy Policy</a>
        <span className="bottom-nav-bar--copy-right">© 2017 IBM</span>
      </div>
    </div>
  </footer>
);

export default Footer;
