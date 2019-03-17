// @flow
import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ResourceForm from './ResourceForm';

type Props = {
  connectDropTarget: PropTypes.object
};

const styles = {
  flex: 1,
  flexDirection: 'column',
  position: 'relative'
};

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
    getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset()
  };
}

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
      <div id="workspace" style={Object.assign({}, styles)}>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        {Object.keys(elements).map(key => {
          const { left, top } = elements[key];
          return (
            <ResourceForm
              key={key}
              id={key}
              left={left}
              top={top}
              connectDragSource=""
              isDragging="false"
            />
          );
        })}
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
