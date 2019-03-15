// @flow
import React, { Component } from 'react';
import Form from 'react-jsonschema-form';

import {DragSource} from "react-dnd";

import styles from 'bootswatch/dist/darkly/bootstrap.min.css';

type Props = {
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
    console.log(props)
    return props;
  },
  endDrag(props, monitor, component) {
    return props.handleDrop(props.val);
  }
};

function collect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging()
    }
}

class ResourceForm extends Component<Props> {
  props: Props;

  render() {
    const { isDragging, connectDragSource, item} = this.props;

    return connectDragSource(
      <div className="item">
           <div className={styles['col-4']}>
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
      </div>
      )

    // return (
    //   <div className={styles['col-4']}>
    //     <div className={styles.card}>
    //       <div className={styles['card-header']}>CardConfig</div>
    //       <div className={styles['card-body']}>
    //         <Form
    //           schema={schema}
    //           onChange={log('changed')}
    //           onSubmit={log('submitted')}
    //           onError={log('errors')}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

export default DragSource("resource", formSource, collect)(ResourceForm)
