// @flow
import React, { Component } from 'react';
// import styles from './Workspace.css';
import Form from 'react-jsonschema-form';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-solarized/bootstrap-solarized-light.css';

type Props = {};

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

export default class Workspace extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Form
          schema={schema}
          onChange={log('changed')}
          onSubmit={log('submitted')}
          onError={log('errors')}
        />
      </div>
    );
  }
}