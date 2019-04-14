// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  isInt: PropTypes.bool,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func
};

export default class NumberField extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.state = {
      errors: []
    };
  }

  update = e => {
    const {id, onChangeField} = this.props;
    const {value} = e.target;
    onChangeField(id, value);
  };

  getErrors() {
    const {errors} = this.state;
    return errors;
  }

  render() {
    const {isInt, defaultValue, value, id} = this.props;

    let classes = "form-control form-control-sm";

    const {errors} = this.state;
    if (errors != null && errors.length > 0) {
      classes += " is-invalid";
    }

    return (
      <input
        id={id}
        type="number"
        step={isInt ? '1' : 'any'}
        className={classes}
        placeholder={defaultValue}
        defaultValue={value}
        onChange={this.update}
      />
    );
  }
}
