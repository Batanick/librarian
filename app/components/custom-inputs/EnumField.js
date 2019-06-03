// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  value: PropTypes.string,
  fieldInfo: PropTypes.obj,
  onChangeField: PropTypes.func
};

export default class EnumField extends Component<Props> {
  update = e => {
    const { id, onChangeField } = this.props;
    onChangeField(id, e.target.value);
  };

  render() {
    const { value, fieldInfo, id } = this.props;
    const { allowedValues } = fieldInfo;
    if (!allowedValues) {
      log.error(`Unable to find allowed values for ${id}`);
      return null;
    }

    return (
      <select
        id={id}
        className="form-control form-control-sm"
        onChange={this.update}
        defaultValue={value}
      >
        {allowedValues.map(opt => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    );
  }
}
