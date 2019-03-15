// @flow
import React, {Component} from 'react';
import Form from 'react-jsonschema-form';

import {DragSource} from "react-dnd";

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

type Props = {
  pos: {
    left: 0,
    top: 0
  }
};

const style = {
  position: 'absolute'
};

const schema = {
  title: 'Todo',
  type: 'object',
  required: ['title'],
  properties: {
    title: {type: 'string', title: 'Title', default: 'A new task'},
    done: {type: 'boolean', title: 'Done?', default: false}
  }
};

const log = type => console.log.bind(console, type);

const formSource = {
  beginDrag(props) {
    // console.log(props)
    return props.pos;
  },
  endDrag(props, monitor, component) {
    console.log("Result:" +  monitor.getDifferenceFromInitialOffset());
    if (!component) {
      return
    }

    // const item = monitor.getItem();
    // const delta = monitor.getDifferenceFromInitialOffset();
    // const left = Math.round(item.left + delta.x);
    // const top = Math.round(item.top + delta.y);
    // console.log(left + ":" + top);
    // component.moveBox(left, top)
  }
};

function collect(connect, monitor) {
  console.log(monitor.getDifferenceFromInitialOffset());

  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
    getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
  }
}

class ResourceForm extends Component<Props> {
  props: Props;

  render() {
    const {
      pos,
      connectDragSource,
      isDragging
    } = this.props;

    if (isDragging) {
      return null
    }

    return connectDragSource(
      <div style={Object.assign({}, style)}>
        <div className={styles.card}>
          <div className={styles['card-header']}>CardConfig</div>
          <div className={styles['card-body']}>
            <Form
              schema={schema}
              // onChange={log('changed')}
              // onSubmit={log('submitted')}
              // onError={log('errors')}
            />
          </div>
        </div>

      </div>
    )
  }

  movePos(left, top) {
    console.log("Drop:" + left);
    this.setState({
      pos: {
        left: left,
        top: top
      }
    });
  }
}

export default DragSource("resource", formSource, collect)(ResourceForm)
