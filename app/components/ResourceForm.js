// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import StringField from './custom-inputs/StringField';
import BooleanField from './custom-inputs/BooleanField';
import NumberField from './custom-inputs/NumberField';

const log = require('electron-log');

// import './ResourceForm.css';

type Props = {
  name: PropTypes.string,
  resId: PropTypes.string,
  dirty: PropTypes.bool,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.fun,
  onSelect: PropTypes.fun,
  selected: PropTypes.bool,
  errors: PropTypes.obj
};

export default class ResourceForm extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
  }

  handleSelect(event) {
    const { onSelect } = this.props;
    event.stopPropagation();
    onSelect(event.shiftKey);
  }

  renderInput(key, fieldInfo, fieldData, errors) {
    const { onChange } = this.props;
    const invalid = errors != null && errors.length > 0;

    switch (fieldInfo.type) {
      case 'string':
        return (
          <StringField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChange}
            invalid={invalid}
          />
        );
      case 'integer':
        return (
          <NumberField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChange}
            isInt
          />
        );
      case 'number':
        return (
          <NumberField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChange}
          />
        );
      case 'boolean':
        return (
          <BooleanField
            id={key}
            type="checkbox"
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChange}
          />
        );

      default:
        log.error(`Unable to render field of type: ${fieldInfo.type}`);
    }
  }

  renderErrors() {
    const { errors } = this.props;
    if (!errors || errors.length === 0) {
      return;
    }

    return (
      <div className="invalid-feedback">
        {errors.map(e => (
          <div>{e}</div>
        ))}
      </div>
    );
  }

  render() {
    const { name, resId, dirty, schema, data, selected, errors } = this.props;

    return (
      <div
        className={selected ? 'card border-info' : 'card'}
        onClick={evt => this.handleSelect(evt)}
        onKeyDown={() => {}}
        role="presentation"
        tabIndex="-1"
      >
        <div className="card-header">
          <h5>{dirty ? `${name}*` : name}</h5>
          <h6 className="card-subtitle text-muted">{resId}</h6>
        </div>

        <div className="card-body">
          <div className="form-group">
            <fieldset>
              {Object.keys(schema.properties).map(key => {
                const fieldInfo = schema.properties[key];
                const fieldData = data[key];
                const fieldErrors = errors ? errors[key] : null;

                return (
                  <div className="form-group row mb-1 has-danger" key={key}>
                    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                    <label
                      htmlFor={key}
                      className="w-25 col-form-label col-form-label-sm"
                    >
                      {fieldInfo.title}
                    </label>
                    <div className="w-75">
                      {this.renderInput(key, fieldInfo, fieldData, fieldErrors)}
                    </div>
                    {this.renderErrors()}
                  </div>
                );
              })}
            </fieldset>
          </div>
        </div>
      </div>
    );
  }
}
