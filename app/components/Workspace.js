// @flow
import React, { Component } from 'react';

// noinspection ES6CheckImport
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ResourceForm from './ResourceForm';
import Dragable from './Dragable';

import * as Events from '../constants/events';

const log = require('electron-log');
const { ipcRenderer } = window.require('electron');

type Props = {
  connectDropTarget: PropTypes.object
};

const styles = {
  position: 'relative',
  width: 5000,
  height: 5000
};

const scrollableStyles = {
  overflowY: 'scroll',
  overflowX: 'scroll',
  maxHeight: '100%',
  maxWidth: '100%',
  position: 'absolute'
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
    getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset()
  };
}

// noinspection JSUnusedGlobalSymbols
const target = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    const delta = monitor.getDifferenceFromInitialOffset();
    const left = Math.round(item.left + delta.x);
    const top = Math.round(item.top + delta.y);

    component.moveChild(item.id, left, top);
  }
};

class Workspace extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
    this.state = {
      elements: {
        ResourceId: { top: 20, left: 80, title: 'Drag me around' },
        ResourceId2: { top: 40, left: 40, title: 'Drag me around' }
      }
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.UPDATE_SCHEMAS, (event, arg) => {
      selfThis.reset(arg)
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.UPDATE_SCHEMAS);
  }

  reset(schemas) {
    this.setState(prevState =>
      update(prevState, {
        schemas: schemas,
        elements: {}
      })
    );

    log.debug(schemas);
  }

  moveChild(id, left, top) {
    this.setState(prevState =>
      update(prevState, {
        elements: {
          [id]: {
            $merge: { left, top }
          }
        }
      })
    );
  }

  render() {
    const { connectDropTarget } = this.props;
    const { elements } = this.state;
    return connectDropTarget(
      <div id="scrollableWorkspace" style={Object.assign({}, scrollableStyles)}>
        <div id="workspace" style={Object.assign({}, styles)}>
          {Object.keys(elements).map(key => {
            const { left, top } = elements[key];
            return (
              <Dragable
                key={key}
                id={key}
                left={left}
                top={top}
                connectDragSource=""
                isDragging="false"
              >
                <ResourceForm name={key} />
              </Dragable>
            );
          })}
        </div>
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
