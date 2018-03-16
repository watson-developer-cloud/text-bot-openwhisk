import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TopNav.css';

const avatar = require('./images/watson-avatar-white.png');
const xIcon = require('./images/x.svg');

export default class TopNav extends Component {
  constructor() {
    super();
    this.onToggle = this.onToggle.bind(this);

    this.state = {
      open: false,
    };
  }

  onToggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <header>
        <div className="wrapper">
          <h1 className="base--h1">
            <a href="/">
              <img className="base--h1-icon" src={avatar} alt="Watson Avatar"/>
              {this.props.title}
            </a>
          </h1>
          <div className="top-bar--spacer"></div>
          <nav className="top-bar homepage">
            <div className="top-bar-menu">
              <ul className="main-nav">
                <li>
                  <a href={this.props.urlGithub}>Fork on GitHub</a>
                </li>
                <li>
                  <a rel="noopener noreferrer" href="https://developer.ibm.com/watson/">Community</a>
                </li>
              </ul>
              <ul className="mobile-nav">
                <li className="nav-drawer-toggler" onClick={this.onToggle}>Menu</li>
              </ul>
            </div>
          </nav>
          <div className={`drawer${this.state.open ? ' open' : ''}`} tabIndex="0">
            <div className="drawer-container">
              <div className="drawer-title">
                <h3>Menu</h3>
                <a className="close-drawer" onClick={this.onToggle}>
                  <img alt="close drawer" src={xIcon}/>
                </a>
              </div>
              <div>
                <ul className="mobile-main-nav">
                  <li className="has-dropdown">
                    <a href={this.props.urlGithub}>Fork on GitHub</a>
                  </li>
                  <li className="has-dropdown">
                    <a rel="noopener noreferrer" href="https://developer.ibm.com/watson/">Community</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

TopNav.props = {
  title: PropTypes.string.isRequired,
  urlGithub: PropTypes.string.isRequired,
};
