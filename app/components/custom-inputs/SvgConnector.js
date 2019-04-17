// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as Consts from '../../constants/constants';
import * as ReactDOM from "react-dom";

const log = require('electron-log');


type Props = {
};

const overlayStyles = {
  position: 'absolute',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE,
  pointerEvents: 'none',
  left: 0,
  top: 0,
  zIndex: 2
};

const svgStyles = {
  pointerEvents: 'auto',
  stroke: "#3498DB",
  strokeWidth: 3
};

const svgStylesSelected = {
  pointerEvents: 'auto',
};

export default class SvgConnector extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.state = {
      selected : false
    }
  }

  render() {
    const target = document.getElementById("workspace");

    return ReactDOM.createPortal(
      (
        <svg style={Object.assign({}, overlayStyles)}>
          <path style={Object.assign({}, svgStyles)} onClick={(e) => log.silly("click")} d="M 100 100 L 200 200"/>
          );
        </svg>), target
    );
  }
}
