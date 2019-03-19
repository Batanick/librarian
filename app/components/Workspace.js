// @flow
import React, { Component } from 'react';

// noinspection ES6CheckImport
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ResourceForm from './ResourceForm';
import Dragable from './Dragable';

import * as Event from '../constants/events';

const { ipcRenderer } = window.require('electron');

type Props = {
  connectDropTarget: PropTypes.object
};

const styles = {
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  minWidth: '1000px',
  minHeight: '1000px'
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
      },
      zoom: 1.0
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Event.ZOOM_IN, () => {
      selfThis.updateZoom(0.1);
    });
    ipcRenderer.on(Event.ZOOM_OUT, () => {
      selfThis.updateZoom(-0.1);
    });
  }

  componentWillUnmount() {
    // Electron IPC example
    ipcRenderer.removeAllListeners(Event.ZOOM_IN);
    ipcRenderer.removeAllListeners(Event.ZOOM_OUT);
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

  updateZoom(delta) {
    const { zoom } = this.state;
    const newValue = Math.min(Math.max(zoom + delta, 0.5), 2);
    this.setState({
      zoom: newValue
    });
  }

  render() {
    const { connectDropTarget } = this.props;
    const { elements, zoom } = this.state;
    return connectDropTarget(
      <div id="workspace" style={Object.assign({}, styles, { zoom })}>
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
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
