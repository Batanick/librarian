// @flow
import React, {Component} from 'react';
import Form from 'react-jsonschema-form';
import PropTypes from 'prop-types';

const log = require('electron-log');


import styles from './ResourceForm.css';

type Props = {
  name: PropTypes.string,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.func
};

function Tpl(props) {
  const {id, label, required, children} = props;
  if (id === "root") {
    return (<div>{children}</div>)
  }

  return (
    <div className="form-group input-group-sm">
      <label className="control-label col-sm-2 lb-sm" htmlFor={id}>{label}{required ? "*" : null}</label>
      <div className="col-md-3 input-group-sm">
        {children}
      </div>
    </div>
  );
}

export default class ResourceForm extends Component<Props> {
  render() {
    const {name, schema, onChange, data} = this.props;

    return (
      <div className={"resource-form"} style={styles}>
        <div className='card-header'>{name}</div>
        <div>
          <Form className="form-horizontal col-lg-10" schema={schema} onChange={onChange} formData={data} FieldTemplate={Tpl}>
            <br/>
          </Form>
        </div>
      </div>
    );
  }
}
