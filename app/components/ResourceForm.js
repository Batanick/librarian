// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dragable from "./Workspace";
import InputField from "./custom-inputs/InputField";

const log = require('electron-log');

// import './ResourceForm.css';

type Props = {
  name: PropTypes.string,
  schema: PropTypes.obj,
  data: PropTypes.obj
};

export default class ResourceForm extends Component<Props> {
  render() {
    const {name, schema} = this.props;

    log.silly(schema);
    return (
      <div className="card">
        <div className='card-header'>
          {name}
        </div>

        <div className='card-body'>
          <form>
            {Object.keys(schema.properties).map(key => {
              // "firstName": {
              //   "type": "string",
              //     "title": "First name",
              //     "default": "Chuck"
              // }
              const fieldInfo = schema.properties[key];

              return (
                <div className="form-group row mb-1" key={key}>
                  <label htmlFor="inputEmail3" className="w-25 col-form-label col-form-label-sm">{fieldInfo.title}</label>
                  <div className="w-75">
                    <InputField type={"string"} defaultValue={fieldInfo.default} value={"empty"} id={key}/>
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
