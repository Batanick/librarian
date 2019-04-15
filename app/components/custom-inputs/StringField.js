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
  type: PropTypes.string,
  onChangeField: PropTypes.func,
  errors: PropTypes.array,
  dataValidators: PropTypes.array
};

export default class StringField extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.attachRef = target => this.setState({ target });
    this.state = {
      showErrorOverlay: false
    };
  }

  componentDidMount() {
    const { value, id, onChangeField } = this.props;
    // triggering validation
    const errors = this.validate(value);
    onChangeField(id, value, errors, true);
  }

  validate(value) {
    const { dataValidators } = this.props;
    const errors = [];

    if (dataValidators && dataValidators.length > 0) {
      for (let i = 0; i < dataValidators.length; i += 1) {
        const validator = dataValidators[i];
        const error = validator(value);
        if (error) {
          errors.push(error);
        }
      }
    }

    if (!value || value === '') {
      errors.push('Value cannot be empty');
    }

    return errors;
  }

  update = value => {
    const { id, onChangeField } = this.props;

    const errors = this.validate(value);
    onChangeField(id, value, errors, false);
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
          {errors.map((e, i) => (
            <span
              key={
                `error-text-${i}` /* eslint-disable-line react/no-array-index-key */
              }
            >
              {e}
              <br />
            </span>
          ))}
        </Tooltip>
      </Overlay>
    );
  }

  render() {
    const { defaultValue, value, id, errors, type } = this.props;

    let classes = 'form-control form-control-sm';
    const invalid = errors && errors.length > 0;
    if (invalid) {
      classes += ' is-invalid';
    }
    return (
      <div>
        <input
          id={id}
          type={type}
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
