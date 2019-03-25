// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ResourceEditor from '../components/ResourceEditor';

type Props = {};

class Root extends Component<Props> {
  render() {
    return <ResourceEditor />;
  }
}

export default DragDropContext(HTML5Backend)(Root);
