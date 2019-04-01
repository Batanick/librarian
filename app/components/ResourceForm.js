// @flow
import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import PropTypes from 'prop-types';

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

type Props = {
  name: PropTypes.string,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.func
};

export default class ResourceForm extends Component<Props> {
  render() {
    const { name, schema, onChange, data } = this.props;

    return (
      <div className={styles.card}>
        <div className={styles['card-header']}>{name}</div>
        <div className={styles['card-body']}>
          <Form schema={schema} onChange={onChange} formData={data} />
        </div>
      </div>
    );
  }
}
