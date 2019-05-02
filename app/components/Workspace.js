// @flow
import React, { Component } from 'react';
// noinspection ES6CheckImport
import update from 'immutability-helper';
import ReactResizeDetector from 'react-resize-detector';
import Draggable from 'react-draggable';

import ResourceForm from './ResourceForm';

import * as IdHelpers from '../js/id-helpers';
import * as JsonUtils from '../js/js-utils';
import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

const log = require('electron-log');

const { ipcRenderer } = window.require('electron');

const defaultOpt = {
  left: 20,
  top: 20
};

type Props = {};

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

export default class Workspace extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    const renderContext = this.buildRenderContext();
    this.state = {
      resources: {},
      schemas: {},
      selected: {},
      renderContext
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.WORKSPACE_LOAD_RESOURCE, (event, res, options) => {
      const type = res[Consts.FIELD_NAME_TYPE];
      const resId = res[Consts.FIELD_NAME_ID];

      selfThis.registerResource(resId, type, res, options);
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
            $merge: { width, height }
          }
        }
      })
    );
  };

  getResourceInfo = id => {
    const { resources } = this.state;
    return resources[id];
  };

  findResourceAt = (x, y) => {
    const { resources } = this.state;
    const ids = Object.keys(resources);
    for (let i = 0; i < ids.length; i += 1) {
      const key = ids[i];
      const { left, top, width, height } = resources[key];
      if (x > left && x < left + width && y > top && y < top + height) {
        return key;
      }
    }

    return null;
  };

  loadResourceById = (id, opt) => {
    ipcRenderer.send(Events.DIALOG_SELECT_EXISTING_RESOURCE, [id], opt);
  };

  createNested = (id, parentId, type) => {
    const value = {};
    value[Consts.FIELD_NAME_TYPE] = type;

    const { resources } = this.state;
    const parent = resources[parentId];

    const opt = {};

    if (parent != null) {
      opt.left = parent.left + parent.width + 50;
      opt.top = parent.top;
    }

    this.registerResource(id, type, value, opt, true);
  };

  retakeOrphan = (oldId, newId) => {
    if (!oldId || !newId) {
      return;
    }

    const { resources } = this.state;
    const old = resources[oldId];

    if (old == null || !old.orphan) {
      log.warn(`Unable to retake target ${oldId} - not orphan`);
      return;
    }

    this.setState(prevState =>
      update(prevState, {
        resources: {
          $apply: function retake(obj) {
            const copy = Object.assign({}, obj);
            IdHelpers.replaceParent(copy, oldId, newId, false);
            return copy;
          }
        }
      })
    );
  };

  makeOrphan = resId => {
    const { resources } = this.state;
    const resValue = resources[resId];
    if (resValue == null) {
      return;
    }

    if (resValue.nested) {
      const newId = JsonUtils.generateUUID();

      this.setState(prevState =>
        update(prevState, {
          resources: {
            $apply: function changeId(obj) {
              const copy = Object.assign({}, obj);
              IdHelpers.replaceParent(copy, resId, newId, true);
              return copy;
            }
          }
        })
      );
    }
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
      makeOrphan: this.makeOrphan,
      createNested: this.createNested,
      retakeOrphan: this.retakeOrphan
    };
  }

  addSelected(key, add) {
    if (!add) {
      this.resetSelected();
    }

    this.setState(prevState =>
      update(prevState, {
        selected: { [key]: { $set: true } }
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
        $set: { selected: {} }
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
    const { selected } = this.state;

    const keys = Object.keys(selected);

    for (let i = 0; i < keys.length; i += 1) {
      this.removeResource(keys[i]);
    }

    this.resetSelected();
  }

  removeResource(resId) {
    this.setState(prevState =>
      update(prevState, {
        resources: {
          $apply: function removeResource(obj) {
            const copy = Object.assign({}, obj);
            delete copy[resId];
            return copy;
          }
        }
      })
    );
  }

  registerResource(resId, type, res, opt, nested) {
    log.info(`Loading resource [${resId}] of type ${type}`);
    const actualOpt = opt == null ? defaultOpt : opt;

    this.disassembleResource(resId, type, res, actualOpt);

    const { left, top } = actualOpt;
    const leftPos = left == null ? 20 : left;
    const topPos = top == null ? 20 : top;

    const { resources } = this.state;
    let entry = resources[resId];
    if (!entry) {
      entry = {};
    }

    entry.top = topPos;
    entry.left = leftPos;
    entry.value = res;
    entry.errors = {};
    entry.dirty = false;
    entry.type = type;
    entry.nested = nested;

    this.setState(prevState =>
      update(prevState, {
        resources: { [resId]: { $set: entry } }
      })
    );
  }

  disassembleResource(resId, type, res, opt) {
    const { schemas } = this.state;
    const schema = schemas[type];

    if (schema == null) {
      log.error(`Unable to find schema for type: ${type}`);
      return;
    }

    if (schema.properties == null) {
      return;
    }

    const optClone = JsonUtils.clone(opt);
    optClone.left += 400;

    Object.keys(schema.properties).forEach(name => {
      const prop = schema.properties[name];
      if (prop.type !== 'object') {
        return;
      }

      const value = res[name];
      if (value == null) {
        return;
      }

      const id = IdHelpers.getNestedId(resId, name);
      res[name] = id;

      this.registerResource(
        id,
        value[Consts.FIELD_NAME_TYPE],
        value,
        optClone,
        true
      );
      optClone.top += 200;
    });
  }

  assembleResource(resId, res) {
    log.silly(`Assembling ${resId}`);
    const { schemas, resources } = this.state;
    const type = res[Consts.FIELD_NAME_TYPE];
    const schema = schemas[type];

    if (schema == null) {
      log.error(`Unable to find schema for type: ${type}`);
      return null;
    }

    if (schema.properties == null) {
      return res;
    }

    const result = JsonUtils.clone(res);

    Object.keys(schema.properties).forEach(name => {
      const prop = schema.properties[name];
      if (prop.type !== 'object') {
        result[name] = res[name];
      }

      const value = res[name];
      if (value == null) {
        return;
      }

      const id = IdHelpers.getNestedId(resId, name);
      const actualValue = resources[id];
      if (actualValue != null) {
        result[name] = this.assembleResource(id, actualValue.value);
      }
    });

    return result;
  }

  saveDirty() {
    const { resources } = this.state;
    const result = {};
    Object.keys(resources).forEach(key => {
      const res = resources[key];
      if (!res.dirty || res.nested) {
        return;
      }

      result[key] = this.assembleResource(key, res.value);
    });

    ipcRenderer.send(Events.WORKSPACE_SAVE_ALL_DIRTY, result);
  }

  updateDirty(ids) {
    const { resources } = this.state;
    ids.forEach(id => {
      const res = resources[id];
      if (res) {
        this.setState(prevState =>
          update(prevState, {
            resources: {
              [id]: {
                $merge: { dirty: false }
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
            $merge: { left, top }
          }
        }
      })
    );
  }

  onDataChange(resId, field, fieldValue, errors, skipDirty) {
    const { resources } = this.state;
    const entry = resources[resId];
    if (!entry) {
      log.error(`Unable to find resource ${resId}`);
      return;
    }

    this.setState(prevState =>
      update(prevState, {
        resources: {
          [resId]: {
            value: { $merge: { [field]: fieldValue } },
            errors: { $merge: { [field]: errors } }
          }
        }
      })
    );

    if (!skipDirty) {
      const parentId = IdHelpers.getParentId(resId);

      this.setState(prevState =>
        update(prevState, {
          resources: {
            [parentId]: {
              $merge: { dirty: true }
            }
          }
        })
      );
    }
  }

  toggleDebugGeometry() {
    const { debugGeometry } = this.state;
    this.setState(prevState =>
      update(prevState, {
        debugGeometry: { $set: !debugGeometry }
      })
    );
  }

  renderDebugTopology(resources) {
    const { debugGeometry } = this.state;
    if (!debugGeometry) {
      return null;
    }

    return (
      <svg style={Object.assign({}, styles)}>
        {Object.keys(resources).map(key => {
          const { left, top, width, height } = resources[key];
          return (
            <path
              style={{ zIndex: 5 }}
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
    const { resources, schemas, selected, renderContext } = this.state;

    // log.silly('rendering workspace');
    // log.silly(schemas);
    // log.silly(resources);
    // log.silly(selected);

    return (
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
            const {
              left,
              top,
              value,
              type,
              dirty,
              errors,
              nested,
              orphan
            } = resources[key];
            const schema = schemas[type];

            if (schema == null) {
              log.error(`Unable to fine schema for type: ${type}`);
              return;
            }

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
              <Draggable
                key={key}
                id={key}
                position={{ x: left, y: top }}
                onDrag={(evt, data) => {
                  this.moveChild(key, data.x, data.y);
                }}
              >
                <div style={{ position: 'absolute' }}>
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
                      nested={nested}
                      orphan={orphan}
                    />
                  </ReactResizeDetector>
                </div>
              </Draggable>
            );
          })}
          <div id="debug-geometry">{this.renderDebugTopology(resources)}</div>
        </div>
      </div>
    );
  }
}
