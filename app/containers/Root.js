// @flow
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';

type Props = {};

const styles = {
  overflowY: 'scroll',
  overflowX: 'scroll'
};

class Root extends Component<Props> {
  render() {
    return (
      <div style={Object.assign({}, styles)}>
        <Workspace connectDropTarget={{}} />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);
