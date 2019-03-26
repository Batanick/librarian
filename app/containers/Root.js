// @flow
import React, {Component} from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DialogHelper from '../components/DialogHelper';
import Workspace from "../components/Workspace";

type Props = {};

class Root extends Component<Props> {
  render() {
    return (
      <div>
        <Workspace/>
        <DialogHelper/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);
