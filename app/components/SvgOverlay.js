// @flow
import React, { Component } from 'react';
// import PropTypes from 'prop-types';

const log = require('electron-log');

type Props = {};

const styles = {
  position: 'absolute',
  width: 5000,
  height: 5000,
  pointerEvents: 'none',
  left: 0,
  top: 0
};

export default class SvgOverlay extends Component<Props> {
  render() {
    log.silly("rendering overlay");
    return (
      <svg id="svg-overlay" style={Object.assign({}, styles)}>
        <circle cx="60" cy="60" r="50" color="white" />
      </svg>
    );
  }
}
