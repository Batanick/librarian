// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  invalid: PropTypes.bool
};

export default class StringField extends Component<Props> {
  static validate(value) {
    const errors = [];

    if (!value || value === '') {
      errors.push('Value cannot be empty');
    }

    return errors;
  }

  update = e => {
    const { id, onChangeField } = this.props;
    const { value } = e.target;

    const errors = StringField.validate(value);
    onChangeField(id, value, errors);
  };

  render() {
    const { defaultValue, value, id, invalid } = this.props;

    let classes = 'form-control form-control-sm';
    if (invalid) {
      classes += ' is-invalid';
    }

    return (
      <input
        id={id}
        type="string"
        className={classes}
        placeholder={defaultValue}
        defaultValue={value}
        onChange={this.update}
      />
    );
  }
}
