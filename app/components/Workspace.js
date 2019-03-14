// @flow
import React, { Component } from 'react';
import ResourceForm from './ResourceForm';

type Props = {};

export default class Workspace extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <h3>Workspace</h3>
        <ResourceForm />
      </div>
    );
  }
}
