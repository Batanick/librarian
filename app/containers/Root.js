// @flow
import React, { Component } from 'react';
import Workspace from '../components/Workspace';
import ResourceTypeSelect from '../components/ResourceTypeSelect';
import ExistingResourceSelect from '../components/ExistingResourceSelect';

// const log = require('electron-log');

type Props = {};

export default class Root extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
  }

  render() {
    return (
      <div>
        <Workspace connectDropTarget={null} />
        <ResourceTypeSelect />
        <ExistingResourceSelect />
      </div>
    );
  }
}
