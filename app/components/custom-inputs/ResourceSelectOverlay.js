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
  onCancel: PropTypes.fun,
  canConnect: PropTypes.fun
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

const overlayStylesNotAllowed = {
  position: 'absolute',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE,
  left: 0,
  top: 0,
  zIndex: 2,
  pointerEvents: 'auto',
  cursor: 'not-allowed'
};

const svgStyles = {
  stroke: '#3498DB',
  strokeWidth: 3,
  fill: 'transparent'
};

export default class ResourceSelectOverlay extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.state = { cursor: null, canConnect: true };
  }

  onMouseMove = e => {
    const scrollable = document.getElementById('scrollableWorkspace');

    const x = e.clientX + scrollable.scrollLeft;
    const y = e.clientY + scrollable.scrollTop;

    const { canConnect } = this.props;
    const dropAllowed = canConnect(x, y) != null;

    this.setState(prevState =>
      update(prevState, {
        cursor: { $set: { x, y } },
        canConnect: { $set: dropAllowed }
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

    const scrollable = document.getElementById('scrollableWorkspace');
    const x = e.clientX + scrollable.scrollLeft;
    const y = e.clientY + scrollable.scrollTop;

    onSelect(x, y);
    e.stopPropagation();
  };

  render() {
    const target = document.getElementById('workspace');
    const { canConnect } = this.state;
    const overlayStyle = canConnect ? overlayStyles : overlayStylesNotAllowed;

    return ReactDOM.createPortal(
      <svg
        style={Object.assign({}, overlayStyle)}
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
