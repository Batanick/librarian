// @flow
import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import PropTypes from 'prop-types';

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

type Props = {
  name: PropTypes.string
};

const schema = {
  title: 'Todo',
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', title: 'Title', default: 'A new task' },
    done: { type: 'boolean', title: 'Done?', default: false }
  }
};

const log = type => console.log.bind(console, type);

export default class ResourceForm extends Component<Props> {
  render() {
    const { name } = this.props;

    return (
      <div className={styles.card}>
        <div className={styles['card-header']}>{name}</div>
        <div className={styles['card-body']}>
          <Form
            schema={schema}
            onChange={log('changed')}
            onSubmit={log('submitted')}
            onError={log('errors')}
          />
        </div>
      </div>
    );
  }
}
