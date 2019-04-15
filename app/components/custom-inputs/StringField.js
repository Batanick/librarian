// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import update from "immutability-helper";
import * as ReactDOM from "react-dom";

const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  errors: PropTypes.array
};

export default class StringField extends Component<Props> {
  static validate(value) {
    const errors = [];

    if (!value || value === '') {
      errors.push('Value cannot be empty');
    }

    return errors;
  }

  constructor(...args) {
    super(...args);

    this.attachRef = target => this.setState({target});
    this.state = {
      show: false,
    };
  }

  componentDidMount() {
    const {value} = this.props;
    // triggering validation
    this.update(value);
  }

  update = value => {
    const {id, onChangeField} = this.props;

    const errors = StringField.validate(value);
    onChangeField(id, value, errors);
  };

  setShow(show) {
    const {currentShow} = this.state;
    if (currentShow === show) {
      return ;
    }
    
    this.setState(prevState =>
      update(prevState, {
        $merge: {
          show: show
        }
      })
    );
  }

  render() {
    const {target, show} = this.state;
    const {defaultValue, value, id, errors} = this.props;

    let classes = 'form-control form-control-sm';
    const invalid = errors && errors.length > 0;
    if (invalid) {
      classes += ' is-invalid';
    }

    return (
      <div>
        <input
          id={id}
          type="string"
          className={classes}
          placeholder={defaultValue}
          defaultValue={value}
          ref={this.attachRef}
          onChange={e => this.update(e.target.value)}
          onFocus={() => this.setShow(true)}
          onBlur={() => this.setShow(false)}
        />
        <Overlay target={target} show={invalid && show} placement="right">
            <Tooltip id="error-tooltip" >
              My Tooltip
            </Tooltip>
        </Overlay>
      </div>
    );
  }
}
