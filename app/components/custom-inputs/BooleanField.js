// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func
};

export default class BooleanField extends Component<Props> {
  update = e => {
    const { id, onChangeField } = this.props;
    const { checked } = e.target;
    onChangeField(id, checked ? 'true' : 'false');
  };

  render() {
    const { defaultValue, value, id } = this.props;
    return (
      <input
        id={id}
        type="checkbox"
        className="form-control form-control-sm"
        placeholder={defaultValue}
        checked={value === 'true'}
        onChange={this.update}
      />
    );
  }
}
