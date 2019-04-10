// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';
import ResourceTypeSelect from '../components/ResourceTypeSelect';
import ExistingResourceSelect from '../components/ExistingResourceSelect';

type Props = {};

class Root extends Component<Props> {
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

export default DragDropContext(HTML5Backend)(Root);
