// @flow
import React, { Component } from 'react';

import PropTypes from 'prop-types';

import * as SvgUtils from './svg-helpers';

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
  zIndex: 2,
  pointerEvents: 'none'
};

const svgStyles = {
  stroke: '#3498DB',
  strokeWidth: 3,
  fill: 'transparent'
};

export default class SvgConnector extends Component<Props> {
  render() {
    const { start, finish } = this.props;

    const path = SvgUtils.BuildSvgPath(start.x, start.y, finish.x, finish.y);

    return (
      <svg style={Object.assign({}, overlayStyles)}>
        <path style={Object.assign({}, svgStyles)} d={path} />
        <circle
          cx={start.x}
          cy={start.y}
          r="2"
          style={Object.assign({}, svgStyles)}
        />
        <circle
          cx={finish.x}
          cy={finish.y}
          r="2"
          style={Object.assign({}, svgStyles)}
        />
      </svg>
    );
  }
}
