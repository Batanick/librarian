// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputField from './custom-inputs/InputField';

// const log = require('electron-log');

// import './ResourceForm.css';

type Props = {
  name: PropTypes.string,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.fun
};

export default class ResourceForm extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
  }

  render() {
    const { name, schema, data, onChange } = this.props;
    return (
      <div className="card">
        <div className="card-header">{name}</div>

        <div className="card-body">
          <form>
            {Object.keys(schema.properties).map(key => {
              const fieldInfo = schema.properties[key];
              const fieldData = data[key];

              return (
                <div className="form-group row mb-1" key={key}>
                  {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                  <label
                    htmlFor={key}
                    className="w-25 col-form-label col-form-label-sm"
                  >
                    {fieldInfo.title}
                  </label>
                  <div className="w-75">
                    <InputField
                      id={key}
                      type="string"
                      defaultValue={fieldInfo.default}
                      value={fieldData}
                      onChangeField={onChange}
                    />
                  </div>
                </div>
              );
            })}
          </form>
        </div>
      </div>
    );
  }
}
