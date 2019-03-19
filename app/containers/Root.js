// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';

type Props = {};

class Root extends Component<Props> {
  render() {
    return <Workspace connectDropTarget={{}} />;
  }
}

export default DragDropContext(HTML5Backend)(Root);
