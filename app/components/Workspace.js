// @flow
import React, { Component } from 'react';
// noinspection ES6CheckImport
import update from 'immutability-helper';
import ReactResizeDetector from 'react-resize-detector';
import Draggable from 'react-draggable';

import ResourceForm from './ResourceForm';

import * as JsonUtils from '../js/js-utils';
import * as Events from '../constants/events';
import * as Consts from '../constants/constants';
import SvgConnector from './custom-inputs/SvgConnector';

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
  position: 'absolute',
  userSelect: 'none'
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
      links: {},
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

  createNested = (parentId, type, value, opt) => {
    const id = JsonUtils.generateUUID();
    this.registerResource(id, type, value, opt, true, parentId);
    return id;
  };

  changeParent = (resourceId, parentId) => {
    log.silly(`Changing parent for: ${resourceId} to ${parentId}`);
    this.setState(prevState =>
      update(prevState, {
        resources: {
          $apply: function removeResource(obj) {
            if (obj[resourceId] == null) {
              return obj;
            }

            const copy = Object.assign({}, obj);
            copy[resourceId].parent = parentId;
            return copy;
          }
        }
      })
    );
  };

  resetWorkspace(schemas) {
    log.info(`Loading schemas: ${Object.keys(schemas)}`);

    const renderContext = this.buildRenderContext();
    this.setState({
      resources: {},
      schemas,
      selected: {},
      links: {},
      renderContext
    });
  }

  buildRenderContext() {
    return {
      getResourceInfo: this.getResourceInfo,
      findResourceAt: this.findResourceAt,
      loadResourceById: this.loadResourceById,
      changeParent: this.changeParent,
      createNested: this.createNested,
      onDataChange: this.onDataChange,
      registerLink: this.registerLink,
      unregisterLink: this.unregisterLink
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

            Object.keys(copy).forEach(key => {
              if (copy[key].parent === resId) {
                copy[key].parent = null;
              }
            });

            delete copy[resId];
            return copy;
          }
        }
      })
    );
  }

  registerResource(resId, type, res, opt, nested, parentId) {
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

    if (nested) {
      entry.parent = parentId;
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

  registerLink = (id, startPosition, finishId) => {
    if (startPosition && finishId) {
      this.setState(prevState =>
        update(prevState, {
          links: { [id]: { $set: { start: startPosition, finish: finishId } } }
        })
      );
    }
  };

  unregisterLink = id => {
    this.setState(prevState =>
      update(prevState, {
        links: {
          $apply: function removeLink(obj) {
            const copy = Object.assign({}, obj);
            delete copy[id];
            return copy;
          }
        }
      })
    );
  };

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

    schema.properties.forEach(prop => {
      const { name } = prop;
      const value = res[name];
      if (value == null) {
        return;
      }

      if (prop.type === 'object') {
        const nestedType = value[Consts.FIELD_NAME_TYPE];
        if (nestedType == null || !schemas[nestedType]) {
          log.error(`Unable to load resource of type: ${nestedType}`);
          return;
        }

        res[name] = this.createNested(resId, nestedType, value, optClone);
        optClone.top += 200;
        return;
      }

      if (
        prop.type === 'array' &&
        prop.elements &&
        prop.elements.type === 'object'
      ) {
        res[name] = [];
        for (let i = 0; i < value.length; i += 1) {
          const element = value[i];
          if (element == null) {
            res[name].push(null);
          } else {
            const nestedType = element[Consts.FIELD_NAME_TYPE];
            if (nestedType == null || !schemas[nestedType]) {
              log.error(`Unable to load resource of type: ${nestedType}`);
            } else {
              const nestedId = this.createNested(
                resId,
                nestedType,
                element,
                optClone
              );
              res[name].push(nestedId);
              optClone.top += 200;
            }
          }
        }
      }
    });
  }

  assembleResource(resId, res) {
    log.info(`Assembling ${resId}`);
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

    schema.properties.forEach(prop => {
      const { name } = prop;
      const value = res[name];
      if (value == null) {
        return;
      }

      if (prop.type === 'object') {
        const actualValue = resources[value];
        if (actualValue != null) {
          result[name] = this.assembleResource(value, actualValue.value);
        }
        return;
      }

      if (
        prop.type === 'array' &&
        prop.elements &&
        prop.elements.type === 'object'
      ) {
        result[name] = [];
        for (let i = 0; i < value.length; i += 1) {
          const elementId = value[i];
          if (elementId == null) {
            result[name].push(null);
          } else {
            const element = resources[elementId];
            const assembled = this.assembleResource(elementId, element.value);
            result[name].push(assembled);
          }
        }

        return;
      }

      // other types
      result[name] = res[name];
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

  onDataChange = (resId, field, fieldValue, errors, skipDirty) => {
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
      this.markParentDirty(resId, resources);
    }
  };

  markParentDirty(resId, resources) {
    let currentId = resId;
    // searching for the root reference parent to mark as dirty
    do {
      const current = resources[currentId];
      if (current == null) {
        break;
      }

      const resToUpdate = currentId;
      if (!current.nested) {
        this.setState(prevState =>
          update(prevState, {
            resources: {
              [resToUpdate]: {
                $merge: { dirty: true }
              }
            }
          })
        );
        break;
      }

      currentId = current.parent;
    } while (currentId != null);
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

  renderLinks() {
    const { links, resources } = this.state;

    return (
      <div>
        {Object.keys(links).map(key => {
          const { start, finish } = links[key];
          const resource = resources[finish];
          if (!start || !start.x || !start.y) {
            return null;
          }

          if (
            !resource ||
            !resource.left ||
            !resource.top ||
            !resource.height
          ) {
            return null;
          }

          return (
            <SvgConnector
              key={key}
              start={{ x: start.x, y: start.y }}
              finish={{
                x: resource.left,
                y: resource.top + resource.height / 2
              }}
            />
          );
        })}
      </div>
    );
  }

  render() {
    const { resources, schemas, selected, renderContext } = this.state;

    log.silly('Rendering workspace');
    // log.silly(schemas);
    // log.silly(JSON.stringify(resources));
    // log.silly(selected);
    // log.silly(links);

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
              parent
            } = resources[key];
            const schema = schemas[type];

            if (schema == null) {
              log.error(`Unable to fine schema for type: ${type}`);
              return;
            }

            const isSelected = selected[key];
            const orphan = nested && parent == null;

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
                enableUserSelectHack={false} // https://github.com/mzabriskie/react-draggable/issues/315
              >
                <div style={{ position: 'absolute' }}>
                  <ReactResizeDetector
                    handleWidth
                    handleHeight
                    onResize={resizeCallback}
                  >
                    <ResourceForm
                      left={left}
                      top={top}
                      schema={schema}
                      data={value}
                      name={name}
                      dirty={dirty}
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
        {this.renderLinks()}
      </div>
    );
  }
}
