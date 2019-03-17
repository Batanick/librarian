// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DragSource } from 'react-dnd';

type Props = {
  connectDragSource: PropTypes.object,
  isDragging: PropTypes.object,
  left: PropTypes.number,
  top: PropTypes.number,
  children: PropTypes.node
};

const style = {
  position: 'absolute'
};

const formSource = {
  beginDrag(props) {
    return { id: props.id, left: props.left, top: props.top };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class Dragable extends Component<Props> {
  render() {
    const { connectDragSource, isDragging, left, top, children } = this.props;

    if (isDragging) {
      return null;
    }

    return connectDragSource(
      <div style={Object.assign({}, style, { left, top })}>{children}</div>
    );
  }
}

export default DragSource('resource', formSource, collect)(Dragable);
