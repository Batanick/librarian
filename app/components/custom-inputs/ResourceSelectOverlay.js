// @flow
import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';

import update from 'immutability-helper';

import PropTypes from 'prop-types';

import * as SvgUtils from './svg-helpers';

import * as Consts from '../../constants/constants';

// const log = require('electron-log');

type Props = {
  start: PropTypes.obj,
  onSelect: PropTypes.fun,
  onCancel: PropTypes.fun
};

const overlayStyles = {
  position: 'absolute',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE,
  left: 0,
  top: 0,
  zIndex: 2,
  pointerEvents: 'auto'
};

const svgStyles = {
  stroke: '#3498DB',
  strokeWidth: 3,
  fill: 'transparent'
};

export default class ResourceSelectOverlay extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.state = { cursor: null };
  }

  onMouseMove = e => {
    const x = e.clientX;
    const y = e.clientY;
    this.setState(prevState =>
      update(prevState, {
        cursor: { $set: { x, y } }
      })
    );
  };

  onKeyPress = e => {
    if (e.key === 'Escape') {
      this.cancelSelection();
    }
  };

  cancelSelection() {
    const { onCancel } = this.props;
    onCancel();
  }

  renderSvg() {
    const { start } = this.props;
    const { cursor } = this.state;

    if (!start || !cursor) {
      return;
    }

    const path = SvgUtils.BuildSvgPath(start.x, start.y, cursor.x, cursor.y);
    return <path style={Object.assign({}, svgStyles)} d={path} />;
  }

  onClickHandler = e => {
    const { onSelect } = this.props;

    const x = e.clientX;
    const y = e.clientY;

    onSelect(x, y);
    e.stopPropagation();
  };

  render() {
    const target = document.getElementById('workspace');

    return ReactDOM.createPortal(
      <svg
        style={Object.assign({}, overlayStyles)}
        onMouseMove={e => this.onMouseMove(e)}
        onClick={this.onClickHandler}
        onKeyDown={e => this.onKeyPress(e)}
        tabIndex="-1" /* required for proper KeyDown */
      >
        {this.renderSvg()}
      </svg>,
      target
    );
  }
}
