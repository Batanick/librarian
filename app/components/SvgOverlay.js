// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const log = require('electron-log');

type Props = {
  links: PropTypes.obj,
  coords: PropTypes.obj
};

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
    const {coords} = this.props;
    log.silly("rendering overlay");
    return (
      <svg id="svg-overlay" style={Object.assign({}, styles)}>
        {Object.keys(coords).map(key => {
          let xy = coords[key];
          return (<circle cx={xy.x} cy={xy.y} r="5" color="white"/>);
        })}
      </svg>
    );
  }
}
