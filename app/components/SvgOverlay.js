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
    const {links, coords} = this.props;

    return (
      <svg id="svg-overlay" style={Object.assign({}, styles)}>
        {Object.keys(links).map(key => {
          let s = coords[key];
          let f = coords[links[key]];
          if (!s || !f) {
            return null;
          }

          const cx = s.x + ((f.x - s.x) / 2);
          const cy = s.y + ((f.y - s.y) / 2);
          log.silly("Start" + JSON.stringify(s));
          log.silly("Finish:" + JSON.stringify(f));

          const path = `M${s.x} ${s.y} Q ${cx} ${s.y}, ${cx} ${cy} T ${f.x} ${f.y}`;
          return (<path d={path} fill="transparent" stroke="#3498DB" strokeWidth={3} />);
        })}
      </svg>
    );
  }
}
