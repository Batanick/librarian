// @flow
import React, {Component} from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';
import ResourceTypeSelect from '../components/ResourceTypeSelect';
import ExistingResourceSelect from '../components/ExistingResourceSelect';

const log = require('electron-log');

type Props = {};

class Root extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
  }

  render() {

    log.silly("Rendering root");
    log.silly(this.state);

    return (
      <div>
        <Workspace connectDropTarget={null}/>
        <ResourceTypeSelect/>
        <ExistingResourceSelect/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);
