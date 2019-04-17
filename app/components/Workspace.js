// @flow
import React, {Component} from 'react';

// noinspection ES6CheckImport
import {DropTarget} from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ResourceForm from './ResourceForm';

import Dragable from './Dragable';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

const log = require('electron-log');

const {ipcRenderer} = window.require('electron');

type Props = {
  connectDropTarget: PropTypes.object
};

const styles = {
  position: 'relative',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE
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
    isOverCurrent: monitor.isOver({shallow: true}),
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

    const renderContext = this.buildRenderContext();
    this.state = {
      resources: {},
      schemas: {},
      selected: {},
      renderContext: renderContext
    };

    this.resetSelected = this.resetSelected.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.WORKSPACE_LOAD_RESOURCE, (event, res) => {
      selfThis.addResource(res);
    });
    ipcRenderer.on(Events.WORKSPACE_UPDATE_SCHEMAS, (event, schemas) => {
      selfThis.resetWorkspace(schemas);
    });
    ipcRenderer.on(Events.WORKSPACE_SAVE_ALL_DIRTY, () => {
      selfThis.saveDirty();
    });
    ipcRenderer.on(Events.WORKSPACE_RESOURCES_SAVED, (event, ids) => {
      selfThis.updateDirty(ids);
    });
    ipcRenderer.send(Events.WORKSPACE_READY);
  }

  resolvePosition(id) {
    const {resources} = this.state;
    const res = resources[id];
    if (res == null) {
      return null;
    }
  }

  registerSize = (id, width, height) => {
    this.setState(prevState =>
      update(prevState, {
        resources: {
          [id]: {
            $merge: {width, height}
          }
        }
      })
    );
  };

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.WORKSPACE_LOAD_RESOURCE);
    ipcRenderer.removeAllListeners(Events.WORKSPACE_UPDATE_SCHEMAS);
  }

  resetWorkspace(schemas) {
    log.info(`Loading schemas: ${Object.keys(schemas)}`);

    const renderContext = this.buildRenderContext();
    this.setState({
      resources: {},
      schemas,
      selected: {},
      renderContext: renderContext
    });
  }

  buildRenderContext() {
    const context = {
      registerSize: this.registerSize
    };

    return context;
  }

  addSelected(key, add) {
    if (!add) {
      this.resetSelected();
    }

    this.setState(prevState =>
      update(prevState, {
        selected: {[key]: {$set: true}}
      })
    );
  }

  resetSelected() {
    this.setState(prevState =>
      update(prevState, {
        $set: {selected: {}}
      })
    );
  }

  handleKeyPress(e) {
    if (e.key === 'Escape') {
      this.resetSelected();
      return;
    }

    if (e.key === 'Delete') {
      this.removeSelected();
    }
  }

  removeSelected() {
    const {selected, resources} = this.state;

    const newResources = {};
    const keys = Object.keys(resources);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (!selected[key]) {
        newResources[key] = resources[key];
      }
    }

    this.setState(prevState =>
      update(prevState, {
        $set: {
          resources: newResources,
          selected: {}
        }
      })
    );
  }

  addResource(res) {
    const resId = res[Consts.FIELD_NAME_ID];
    const type = res[Consts.FIELD_NAME_TYPE];
    log.info(`Loading resource [${resId}] of type ${type}`);

    const entry = {
      top: 20,
      left: 20,
      title: resId,
      value: res,
      errors: {},
      dirty: false,
      type
    };

    this.setState(prevState =>
      update(prevState, {
        resources: {[resId]: {$set: entry}}
      })
    );
  }

  saveDirty() {
    const {resources} = this.state;
    const result = {};
    Object.keys(resources).forEach(key => {
      const res = resources[key];
      if (res.dirty) {
        result[key] = res.value;
      }
    });

    log.silly(`Sending save response: ${JSON.stringify(result)}`);
    ipcRenderer.send(Events.WORKSPACE_SAVE_ALL_DIRTY, result);
  }

  updateDirty(ids) {
    const {resources} = this.state;
    ids.forEach(id => {
      const res = resources[id];
      if (res) {
        this.setState(prevState =>
          update(prevState, {
            resources: {
              [id]: {
                $merge: {dirty: false}
              }
            }
          })
        );
      }
    });
  }

  moveChild(id, left, top) {
    this.setState(prevState =>
      update(prevState, {
        resources: {
          [id]: {
            $merge: {left, top}
          }
        }
      })
    );
  }

  onDataChange(resId, field, fieldValue, errors, skipDirty) {
    const {resources} = this.state;
    const entry = resources[resId];
    if (!entry) {
      log.error(`Unable to find resource ${resId}`);
      return;
    }

    this.setState(prevState =>
      update(prevState, {
        resources: {
          [resId]: {
            value: {$merge: {[field]: fieldValue}},
            errors: {$merge: {[field]: errors}}
          }
        }
      })
    );

    if (!skipDirty) {
      this.setState(prevState =>
        update(prevState, {
          resources: {
            [resId]: {
              $merge: {dirty: true}
            }
          }
        })
      );
    }
  }

  render() {
    const {connectDropTarget} = this.props;
    const {resources, schemas, selected, renderContext} = this.state;

    log.silly("rendering workspace");
    // log.silly(schemas);
    // log.silly(resources);
    // log.silly(selected);

    return connectDropTarget(
      <div id="scrollableWorkspace" style={Object.assign({}, scrollableStyles)}>
        <div
          id="workspace"
          style={Object.assign({}, styles)}
          onClick={this.resetSelected}
          onKeyDown={e => this.handleKeyPress(e)}
          tabIndex="-1" /* required for proper KeyDown */
          role="presentation"
        >
          {Object.keys(resources).map(key => {
            const {left, top, value, type, dirty, errors} = resources[key];
            const schema = schemas[type];
            const isSelected = selected[key];

            const selfThis = this;
            const onChange = function changeWrapper(
              fieldId,
              fieldValue,
              fieldErrors,
              skipDirty
            ) {
              selfThis.onDataChange(
                key,
                fieldId,
                fieldValue,
                fieldErrors,
                skipDirty
              );
            };

            const onSelect = function selectWrapper(add) {
              selfThis.addSelected(key, add);
           };

            const name = value[Consts.FIELD_NAME_NAME];

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
                  schema={schema}
                  data={value}
                  name={name}
                  dirty={dirty}
                  onChange={onChange}
                  onSelect={onSelect}
                  resId={key}
                  selected={isSelected}
                  errors={errors}
                  renderContext={renderContext}/>

              </Dragable>
            );
          })}
        </div>
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
