// @flow
import React, {Component} from 'react';
import Form from 'react-jsonschema-form';

import {DragSource} from "react-dnd";

type Props = {
  id: ""
};

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

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
    return {id: props.id};
  },
  endDrag(props, monitor, component) {
    // console.log(monitor.getDifferenceFromInitialOffset());
    if (!component) {
      return
    }

    const delta = monitor.getDifferenceFromInitialOffset();
    // const left = Math.round(item.left + delta.x);
    // const top = Math.round(item.top + delta.y);
    // component.moveBox(left, top)
  }
};

function collect(connect, monitor) {
  // console.log(monitor.didDrop());

  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }
}

class ResourceForm extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {pos: {left: 42, top: 20}};
  }

  state: {
    pos: {
      left: 10,
      top: 10
    }
  };

  render() {
    const {
      connectDragSource,
      isDragging
    } = this.props;

    const left = this.state.pos.left;
    const top = this.state.pos.top;

    if (isDragging) {
      return null
    }

    console.log(this.state);

    return connectDragSource(
      <div style={Object.assign({}, style, {left, top})}>
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

  // movePos(left, top) {
  //   console.log("Drop:" + left);
  //   this.setState({
  //     pos: {
  //       left: left,
  //       top: top
  //     }
  //   });
  // }
}

export default DragSource("resource", formSource, collect)(ResourceForm)
