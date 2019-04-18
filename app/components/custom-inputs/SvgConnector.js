// @flow
import React, {Component} from 'react';
import * as ReactDOM from "react-dom";

import PropTypes from 'prop-types';

import * as Consts from '../../constants/constants';

const log = require('electron-log');


type Props = {
  x1: PropTypes.int,
  x2: PropTypes.int,
  y1: PropTypes.int,
  y2: PropTypes.int
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
  strokeWidth: 3,
  fill: "transparent"
};

const svgStylesSelected = {
  pointerEvents: 'auto',
  stroke: "#3498DB",
  strokeWidth: 3,
  fill: "transparent"
};

export default class SvgConnector extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.state = {
      selected: false
    }
  }

  render() {
    const target = document.getElementById("workspace");
    const {x1, x2, y1, y2} = this.props;

    const cx = x1 + ((x2 - x1) / 2);
    const cy = y1 + ((y2 - y1) / 2);

    const path = `M${x1} ${y1} Q ${cx} ${y1}, ${cx} ${cy} T ${x2} ${y2}`;

    return ReactDOM.createPortal(
      (
        <svg style={Object.assign({}, overlayStyles)}>
          <path style={Object.assign({}, svgStyles)} onClick={(e) => log.silly("click")} d={path}/>
        </svg>), target
    );
  }
}
