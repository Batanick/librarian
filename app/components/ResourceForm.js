// @flow
import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import PropTypes from 'prop-types';

import { DragSource } from 'react-dnd';

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

type Props = {
  connectDragSource: PropTypes.object,
  isDragging: PropTypes.object,
  left: 0,
  top: 0
};

const style = {
  position: 'absolute'
};

const schema = {
  title: 'Todo',
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', title: 'Title', default: 'A new task' },
    done: { type: 'boolean', title: 'Done?', default: false }
  }
};

const log = type => console.log.bind(console, type);

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

class ResourceForm extends Component<Props> {
  render() {
    const { connectDragSource, isDragging, left, top } = this.props;

    if (isDragging) {
      return null;
    }

    return connectDragSource(
      <div style={Object.assign({}, style, { left, top })}>
        <div className={styles.card}>
          <div className={styles['card-header']}>CardConfig</div>
          <div className={styles['card-body']}>
            <Form
              schema={schema}
              onChange={log('changed')}
              onSubmit={log('submitted')}
              onError={log('errors')}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DragSource('resource', formSource, collect)(ResourceForm);
