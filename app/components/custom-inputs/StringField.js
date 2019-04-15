// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import update from 'immutability-helper';

// const log = require('electron-log');

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

    this.attachRef = target => this.setState({ target });
    this.state = {
      showErrorOverlay: false
    };
  }

  componentDidMount() {
    const { value } = this.props;
    // triggering validation
    this.update(value);
  }

  update = value => {
    const { id, onChangeField } = this.props;

    const errors = StringField.validate(value);
    onChangeField(id, value, errors);
  };

  setShowErrorOverlay(show) {
    this.setState(prevState =>
      update(prevState, {
        $merge: {
          showErrorOverlay: show
        }
      })
    );
  }

  renderOverlay() {
    const { target, showErrorOverlay } = this.state;
    const { errors } = this.props;
    if (!showErrorOverlay || errors == null || errors.length <= 0) {
      return;
    }

    return (
      <Overlay target={target} show placement="right">
        <Tooltip id="error-tooltip">
          {errors.map(e => (
            <text>
              {e}
              <br />
            </text>
          ))}
        </Tooltip>
      </Overlay>
    );
  }

  render() {
    const { defaultValue, value, id, errors } = this.props;

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
          onFocus={() => this.setShowErrorOverlay(true)}
          onBlur={() => this.setShowErrorOverlay(false)}
        />
        {this.renderOverlay()}
      </div>
    );
  }
}
