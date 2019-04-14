// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import update from 'immutability-helper';

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
  selected: PropTypes.bool
};

export default class ResourceForm extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.state = {
      errors: {}
    }
  }

  handleSelect(event) {
    const {onSelect} = this.props;
    event.stopPropagation();
    onSelect(event.shiftKey);
  }

  onFieldChange(field, fieldValue, errors) {
    this.setState(prevState =>
      update(prevState, {
        errors: {[field]: {$set: errors}}
      })
    );
  }

  renderInput(key, fieldInfo, fieldData) {
    const {onChange} = this.props;

    const onChangeWrapper = (field, fieldValue, errors) => {
      this.onFieldChange(field, fieldValue, errors);
      onChange(field, fieldValue, errors);
    };

    switch (fieldInfo.type) {
      case 'string':
        return (
          <StringField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChangeWrapper}
          />
        );
      case 'integer':
        return (
          <NumberField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChangeWrapper}
            isInt
          />
        );
      case 'number':
        return (
          <NumberField
            id={key}
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChangeWrapper}
          />
        );
      case 'boolean':
        return (
          <BooleanField
            id={key}
            type="checkbox"
            defaultValue={fieldInfo.default}
            value={fieldData}
            onChangeField={onChangeWrapper}
          />
        );

      default:
        log.error(`Unable to render field of type: ${fieldInfo.type}`);
    }
  }

  static renderErrors(errors) {
    if (true) {
      return (<div className="invalid-feedback">
        lalala
      </div>)
    }

    if (!errors || errors.length === 0) {
      return;
    }

    return (<div className="invalid-feedback">
      {errors.map((e, i) => {
        return <h6 key={`error-${i}`}>{e}</h6>
      })}
    </div>);
  }

  render() {
    const {name, resId, dirty, schema, data, selected} = this.props;
    const {errors} = this.state;

    return (
      <div
        className={selected ? 'card border-info' : 'card'}
        onClick={evt => this.handleSelect(evt)}
        onKeyDown={() => {
        }}
        role="presentation"
        tabIndex="-1"
      >
        <div className="card-header">
          <h5>{dirty ? `${name}*` : name}</h5>
          <h6 className="card-subtitle text-muted">{resId}</h6>
        </div>

        <div className="card-body">
          <form noValidate>
            {Object.keys(schema.properties).map(key => {
              const fieldInfo = schema.properties[key];
              const fieldData = data[key];
              const fieldErrors = errors[key];

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
                    {this.renderInput(key, fieldInfo, fieldData)}
                  </div>
                  {ResourceForm.renderErrors(fieldErrors)}
                </div>
              );
            })}
          </form>
        </div>
      </div>
    );
  }
}
