// @flow
import React, {Component} from 'react';

import ResourceForm from './ResourceForm';
import {DropTarget} from 'react-dnd';

type Props = {
  pos: {
    left: 0,
    top: 0
  }
};
const styles = {
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
};

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({shallow: true}),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
    getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset()
  }
}

const target = {
  drop(props, monitor, component) {

    const item = monitor.getItem();
    const delta = monitor.getDifferenceFromInitialOffset();
    const left = Math.round(item.left + delta.x);
    const top = Math.round(item.top + delta.y);

    component.moveChild(item.id, delta.x, delta.y)
  }

};

class Workspace extends Component<Props> {
  props: Props;

  render() {
    const {connectDropTarget} = this.props;

    return connectDropTarget((

      <div id="workspace" style={Object.assign({}, styles)}>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <h3>Workspace</h3>
        <ResourceForm id={"RandomResourceId"}/>
      </div>
    ));
  }

  moveChild(id, left, top) {
    console.log({id: id, left: left, top: top});
  }
}

export default DropTarget("resource", target, collect)(Workspace);
