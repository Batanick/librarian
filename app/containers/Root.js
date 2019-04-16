// @flow
import React, {Component} from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';
import ResourceTypeSelect from '../components/ResourceTypeSelect';
import ExistingResourceSelect from '../components/ExistingResourceSelect';

import {OverlayContext} from '../components/OverlayContext'
import SvgOverlay from "../components/SvgOverlay";
import update from "immutability-helper";

const log = require('electron-log');

type Props = {};

const dummyContext = {
  registerLink: (sourceId, targetId) => {
    log.silly(sourceId, targetId);
  },
};

class Root extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.registerLink = (x, y) => {
      this.setState(prevState =>
        update(prevState, {
          $set: {value: x}
        })
      );
      log.silly(`Called ${x}, ${y}`);
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      overlayContext: {
        registerLink: this.registerLink
      }
    };
  }

  render() {
    const {overlayContext, value} = this.state;
    log.silly("Rendering root: " + value);
    return (
      <div>
        <OverlayContext.Provider value={overlayContext}>
          <Workspace connectDropTarget={null}/>
        </OverlayContext.Provider>
        <ResourceTypeSelect/>
        <ExistingResourceSelect/>
        <SvgOverlay/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);
