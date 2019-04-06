// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  type: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.fun
};

export default class InputField extends Component<Props> {
  update = e => {
    const { id, onChangeField } = this.props;
    const { value } = e.target;
    onChangeField(id, value);
  };

  render() {
    const { type, defaultValue, value, id } = this.props;
    return (
      <input
        id={id}
        type={type}
        className="form-control form-control-sm"
        placeholder={defaultValue}
        defaultValue={value}
        onChange={this.update}
      />
    );
  }
}
