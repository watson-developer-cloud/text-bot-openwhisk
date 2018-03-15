import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="_full-width-row bottom-nav-bar footer">
    <div className="_container">
      <div className="bottom-nav-bar--row bottom-nav-bar--row_1">
        <a rel="noopener noreferrer" href="https://www.ibm.com/watson/developer/" className="base--a bottom-nav-bar--nav-link" target="_blank">Built with IBM Watson</a>
        <a rel="noopener noreferrer" href="https://www.ibm.com/watson/services/conversation/" className="base--a bottom-nav-bar--nav-link" target="_blank">Watson Assistant API</a>
      </div>
      <div className="bottom-nav-bar--row bottom-nav-bar--row_2">
        <a rel="noopener noreferrer" href="#ibm-com" className="base--a bottom-nav-bar--nav-link" target="_blank">ibm.com</a>
        <a rel="noopener noreferrer" href="#terms-of-use" className="base--a bottom-nav-bar--nav-link" target="_blank">Terms of Use</a>
        <a rel="noopener noreferrer" href="#privacy-policy" className="base--a bottom-nav-bar--nav-link" target="_blank">Privacy Policy</a>
        <span className="bottom-nav-bar--copy-right">© 2017 IBM</span>
      </div>
    </div>
  </footer>
);

export default Footer;
