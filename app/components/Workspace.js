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
      resources: {},
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
    ipcRenderer.send(Events.WORKSPACE_READY);
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
      value: res,
      dirty: false,
      type
    };

    this.setState(prevState =>
      update(prevState, {
        resources: { [resId]: { $set: entry } }
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
  }

  onDataChange(id, data) {
    const { resources } = this.state;
    const entry = resources[id];
    if (!entry) {
      log.error(`Unable to find resource ${id}`);
      return;
    }

    this.setState(prevState =>
      update(prevState, {
        resources: {
          [id]: {
            $merge: { dirty: true, value: data }
          }
        }
      })
    );
  }

  render() {
    const { connectDropTarget } = this.props;
    const { resources, schemas } = this.state;

    return connectDropTarget(
      <div id="scrollableWorkspace" style={Object.assign({}, scrollableStyles)}>
        <div id="workspace" style={Object.assign({}, styles)}>
          {Object.keys(resources).map(key => {
            const { left, top, value, type, dirty } = resources[key];
            const schema = schemas[type];

            const selfThis = this;
            const onChange = function changeWrapper(event) {
              selfThis.onDataChange(key, event.formData);
            };

            return (
              <Dragable
                key={key}
                id={key}
                left={left}
                top={top}
                connectDragSource=""
                isDragging="false"
              >
                <ResourceForm
                  name={dirty ? `${key}*` : key}
                  schema={schema}
                  data={value}
                  onChange={onChange}
                />
              </Dragable>
            );
          })}
        </div>
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
