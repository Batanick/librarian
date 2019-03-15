// @flow
import React, { Component } from 'react';

import HTML5Backend from 'react-dnd-html5-backend'
import {DragDropContext} from 'react-dnd'

import ResourceForm from './ResourceForm';

type Props = {};

class Workspace extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <h3>Workspace</h3>
        <ResourceForm val = "42"/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Workspace)
