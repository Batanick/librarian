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

class Root extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.registerLink = (source, target) => {
      this.setState(prevState =>
        update(prevState, {
          links: {
            $merge: {[source]: target}
          }
        })
      );
    };

    this.updateCoords = (id, x, y) => {
      log.silly(id);
      this.setState(prevState =>
        update(prevState, {
          coords: {[id]: {$set: {x: x, y: y}}}
        })
      );
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      overlayContext: {
        registerLink: this.registerLink,
        updateCoords: this.updateCoords
      },
      coords: {},
      links: {}
    };
  }

  render() {
    const {overlayContext, links, coords} = this.state;

    log.silly("Rendering root");
    log.silly(this.state);

    return (
      <div>
        <OverlayContext.Provider value={overlayContext}>
          <Workspace connectDropTarget={null}/>
        </OverlayContext.Provider>
        <ResourceTypeSelect/>
        <ExistingResourceSelect/>
        <SvgOverlay coords={coords} links={links}/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);
