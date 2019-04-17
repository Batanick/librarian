// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const log = require('electron-log');


type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
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
    // const {overlayContext, onChangeField} = this.props;
    // overlayContext.registerLink(this.getId(), value);
    // onChangeField(id, value, [], false);
  };

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
