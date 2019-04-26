// @flow
import React, {Component} from 'react';
// noinspection ES6CheckImport
import {DropTarget} from 'react-dnd';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import ReactResizeDetector from 'react-resize-detector';

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
      renderContext,
      creatingNew: false
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.WORKSPACE_LOAD_RESOURCE, (event, res, options) => {
      const type = res[Consts.FIELD_NAME_TYPE];
      selfThis.addResource(res, type, options);
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

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.WORKSPACE_LOAD_RESOURCE);
    ipcRenderer.removeAllListeners(Events.WORKSPACE_UPDATE_SCHEMAS);
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

  getResourceInfo = id => {
    const {resources} = this.state;
    return resources[id];
  };

  findResourceAt = (x, y) => {
    const {resources} = this.state;
    const ids = Object.keys(resources);
    for (let i = 0; i < ids.length; i += 1) {
      const key = ids[i];
      const {left, top, width, height} = resources[key];
      if (x > left && x < left + width && y > top && y < top + height) {
        return key;
      }
    }

    return null;
  };

  loadResourceById = (id, opt) => {
    ipcRenderer.send(Events.DIALOG_SELECT_EXISTING_RESOURCE, [id], opt);
  };

  resetWorkspace(schemas) {
    log.info(`Loading schemas: ${Object.keys(schemas)}`);

    const renderContext = this.buildRenderContext();
    this.setState({
      resources: {},
      schemas,
      selected: {},
      renderContext
    });
  }

  buildRenderContext() {
    return {
      getResourceInfo: this.getResourceInfo,
      findResourceAt: this.findResourceAt,
      loadResourceById: this.loadResourceById,
      addNestedResource: this.addNestedResource
    };
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

  handleClick = event => {
    const resId = this.findResourceAt(event.clientX, event.clientY);
    if (resId == null) {
      this.resetSelected();
    }

    this.addSelected(resId, event.shiftKey);
  };

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
      return;
    }

    if (e.key === 'p') {
      this.toggleDebugGeometry();
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

  addNestedResource(type, opt) {
    log.error(type, opt);
  }

  addResource(res, type, opt) {
    const resId = res[Consts.FIELD_NAME_ID];
    log.info(`Loading resource [${resId}] of type ${type}`);

    let leftPos = 20;
    let topPos = 20;

    if (opt != null && opt.pos != null) {
      const {left, top} = opt.pos;
      leftPos = left;
      topPos = top;
    }

    const {resources} = this.state;
    let entry = resources[resId];
    if (!entry) {
      entry = {};
    }

    entry.top = topPos;
    entry.left = leftPos;
    entry.title = resId;
    entry.value = res;
    entry.errors = {};
    entry.dirty = false;
    entry.type = type;

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

  toggleDebugGeometry() {
    const {debugGeometry} = this.state;
    this.setState(prevState =>
      update(prevState, {
        debugGeometry: {$set: !debugGeometry}
      })
    );
  }

  renderDebugTopology(resources) {
    const {debugGeometry} = this.state;
    if (!debugGeometry) {
      return null;
    }

    return (
      <svg style={Object.assign({}, styles)}>
        {Object.keys(resources).map(key => {
          const {left, top, width, height} = resources[key];
          return (
            <path
              style={{zIndex: 5}}
              key={`debug-${key}`}
              d={`M ${left} ${top} L ${left + width} ${top + height}`}
              stroke="red"
              strokeWidth={2}
              color="red"
            />
          );
        })}
      </svg>
    );
  }

  render() {
    const {connectDropTarget} = this.props;
    const {resources, schemas, selected, renderContext} = this.state;

    // log.silly('rendering workspace');
    // log.silly(schemas);
    // log.silly(resources);
    // log.silly(selected);

    return connectDropTarget(
      <div id="scrollableWorkspace" style={Object.assign({}, scrollableStyles)}>
        <div
          id="workspace"
          style={Object.assign({}, styles)}
          onClick={e => this.handleClick(e)}
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

            const resizeCallback = (width, height) => {
              this.registerSize(key, width, height);
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
                <ReactResizeDetector
                  handleWidth
                  handleHeight
                  onResize={resizeCallback}
                >
                  <ResourceForm
                    schema={schema}
                    data={value}
                    name={name}
                    dirty={dirty}
                    onChange={onChange}
                    resId={key}
                    selected={isSelected}
                    errors={errors}
                    renderContext={renderContext}
                  />
                </ReactResizeDetector>
              </Dragable>
            );
          })}
          <div id="debug-geometry">{this.renderDebugTopology(resources)}</div>
        </div>
      </div>
    );
  }
}

export default DropTarget('resource', target, collect)(Workspace);
