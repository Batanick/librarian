// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  type: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string
};

export default class InputField extends Component<Props> {
  render() {
    const {type, defaultValue, value, id} =  this.props;
    return (
      <input id={id} type={type} className="form-control form-control-sm" placeholder={defaultValue} defaultValue={value}/>
    );
  }
}
