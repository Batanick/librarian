// @flow
import React, {Component} from 'react';
import * as ReactDOM from "react-dom";

import PropTypes from 'prop-types';

import * as Consts from '../../constants/constants';

const log = require('electron-log');


type Props = {
  start: PropTypes.obj,
  finish: PropTypes.obj,
  selectionMode: PropTypes.bool
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
    const {start, finish} = this.props;

    const cx = start.x + ((finish.x - start.x) / 2);
    const cy = start.y + ((finish.y - start.y) / 2);

    const path = `M${start.x} ${start.y} Q ${cx} ${start.y}, ${cx} ${cy} T ${finish.x} ${finish.y}`;

    return ReactDOM.createPortal(
      (
        <svg style={Object.assign({}, overlayStyles)}>
          <path style={Object.assign({}, svgStyles)} onClick={(e) => log.silly("click")} d={path}/>
        </svg>), target
    );
  }
}
