// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func
};

export default class StringField extends Component<Props> {
  static validate(value) {
    const errors = [];

    if (!value || value === "") {
      errors.push("Value cannot be empty");
    }

    return errors;
  }

  update = e => {
    const {id, onChangeField} = this.props;
    const {value} = e.target;

    const errors = StringField.validate(value);
    onChangeField(id, value, errors);
  };

  render() {
    const {defaultValue, value, id} = this.props;
    return (
      <input
        id={id}
        type="string"
        className="form-control form-control-sm invalid"
        placeholder={defaultValue}
        defaultValue={value}
        onChange={this.update}
      />
    );
  }
}
