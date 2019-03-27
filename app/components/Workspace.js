// @flow
import React, { Component } from 'react';

// noinspection ES6CheckImport
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ResourceForm from './ResourceForm';

import Dragable from './Dragable';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

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

const defaultSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', title: 'Title', default: 'A new task' },
    done: { type: 'boolean', title: 'Done?', default: false }
  }
};

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
      resources: {
        ResourceId: { top: 20, left: 80, title: 'Drag me around', value: {} },
        ResourceId2: { top: 40, left: 40, title: 'Drag me around', value: {} }
      },
      schemas: null
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.WORKSPACE_LOAD_RESOURCE, (event, res) => {
      selfThis.addNewResource(res);
    });
    ipcRenderer.on(Events.WORKSPACE_UPDATE_SCHEMAS, (event, schemas) => {
      selfThis.resetWorkspace(schemas);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.WORKSPACE_LOAD_RESOURCE);
    ipcRenderer.removeAllListeners(Events.WORKSPACE_UPDATE_SCHEMAS);
  }

  resetWorkspace(schemas) {
    log.info(`Loading schemas: ${Object.keys(schemas)}`);

    this.setState({
      resources: {},
      schemas
    });
  }

  addNewResource(res) {
    const resId = res[Consts.FIELD_NAME_ID];
    const type = res[Consts.FIELD_NAME_TYPE];
    log.info(`Loading resource [${resId}] of type ${type}`);

    const entry = {
      top: 20,
      left: 20,
      title: resId,
      content: res
    };

    this.setState(prevState =>
      update(prevState, {
        resources: { [resId.toString()]: { $set: entry } }
      })
    );
  }

  moveChild(id, left, top) {
    this.setState(prevState =>
      update(prevState, {
        resources: {
          [id]: {
            $merge: { left, top }
          }
        }
      })
    );
    log.silly(this.state);
  }

  render() {
    const { connectDropTarget } = this.props;
    const { resources } = this.state;

    return connectDropTarget(
      <div id="scrollableWorkspace" style={Object.assign({}, scrollableStyles)}>
        <div id="workspace" style={Object.assign({}, styles)}>
          {Object.keys(resources).map(key => {
            const { left, top } = resources[key];
            return (
              <Dragable
                key={key}
                id={key}
                left={left}
                top={top}
                connectDragSource=""
                isDragging="false"
              >
                <ResourceForm name={key} schema={defaultSchema} />
              </Dragable>
            );
          })}
        </div>
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
