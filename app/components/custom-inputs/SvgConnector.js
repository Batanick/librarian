// @flow
import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import * as Consts from '../../constants/constants';

// const log = require('electron-log');

type Props = {
  start: PropTypes.obj,
  finish: PropTypes.obj
};

const overlayStyles = {
  position: 'absolute',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE,
  left: 0,
  top: 0,
  zIndex: -1,
  pointerEvents: 'none'
};

const svgStyles = {
  stroke: '#3498DB',
  strokeWidth: 3,
  fill: 'transparent'
};

export default class SvgConnector extends Component<Props> {
  render() {
    const target = document.getElementById('workspace');
    const { start, finish } = this.props;

    const p1 = start;
    const p2 = finish;

    const cx = p1.x + (p2.x - p1.x) / 2;
    const cy = p1.y + (p2.y - p1.y) / 2;

    const path = `M${p1.x} ${p1.y} Q ${cx} ${p1.y}, ${cx} ${cy} T ${p2.x} ${
      p2.y
    }`;

    return ReactDOM.createPortal(
      <svg style={Object.assign({}, overlayStyles)}>
        <path style={Object.assign({}, svgStyles)} d={path} />
      </svg>,
      target
    );
  }
}
