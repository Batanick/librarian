// @flow
import React, { Component } from 'react';
import Form from 'react-jsonschema-form';

import 'bootswatch/dist/spacelab/bootstrap.min.css';

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

export default class ResourceForm extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="col-sm-3">
        <div className="card 18-rem">
          <div className="card-body">
            <Form
              schema={schema}
              onChange={log('changed')}
              onSubmit={log('submitted')}
              onError={log('errors')}
            />
          </div>
        </div>
      </div>
    );
  }
}