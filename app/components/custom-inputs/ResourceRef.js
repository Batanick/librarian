// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {OverlayContext} from '../OverlayContext';

const log = require('electron-log');


type Props = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  overlayContext: PropTypes.obj
};

export default class ResourceRef extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.target = React.createRef();
  }

  update = e => {
  };

  componentDidUpdate(prevProps) {
    const {overlayContext} = this.props;
    overlayContext.registerLink(42, 43);
  }

  render() {
    const {value, id} = this.props;

    return (
      <input ref={this.target}
             id={id}
             type="checkbox"
             className="form-control form-control-sm"
             checked={value === 'true'}
             onChange={this.update}
      />
    );
  }
}
