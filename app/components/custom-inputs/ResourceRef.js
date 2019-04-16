// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {OverlayContext} from '../OverlayContext';

const log = require('electron-log');


type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  overlayContext: PropTypes.obj
};

export default class ResourceRef extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.target = React.createRef();
  }

  update = value => {
    if (value == null || value === "") {
      return;
    }
    const {overlayContext, onChangeField} = this.props;
    overlayContext.registerLink(this.getId(), value);
    onChangeField(id, value, [], false);
  };

  componentDidMount() {
    const {value} = this.props;
    if (value == null || value === "") {
      return;
    }

    const {overlayContext} = this.props;
    overlayContext.registerLink(this.getId(), value);
  }

  componentDidUpdate(prevProps) {
    const {overlayContext} = this.props;
    const id = this.getId();
    const box = this.target.current.getBoundingClientRect();

    overlayContext.updateCoords(id, box.right, box.top + box.height / 2);
  }

  getId() {
    const {id, resourceId} = this.props;
    return `${resourceId}_${id}`;
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
