// @flow
import React, { Component } from 'react';

import ModalSelect from './ModalSelect';
import * as Events from '../constants/events';

const log = require('electron-log');

const { ipcRenderer } = window.require('electron');

type Props = {};

export default class ResourceTypeSelect extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
    this.state = {
      createDialogShow: false,
      createDialogSchemas: []
    };

    this.onTypeSelectCancelled = this.onTypeSelectCancelled.bind(this);
    this.onTypeSelect = this.onTypeSelect.bind(this);
  }

  componentDidMount() {
    const selfThis = this;
    log.silly('2');
    ipcRenderer.on(Events.DIALOG_SELECT_SCHEMA_TYPE, (event, arg) => {
      log.silly(arg);
      selfThis.showSchemaTypeSelection(arg);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.DIALOG_SELECT_SCHEMA_TYPE);
  }

  onTypeSelectCancelled() {
    this.setState({
      createDialogSchemas: [],
      createDialogShow: false
    });
  }

  onTypeSelect(type) {
    log.silly(`Selected:${type}`);
    this.onTypeSelectCancelled();

    if (type) {
      ipcRenderer.send(Events.DIALOG_SCHEMA_TYPE_SELECTED, type);
    }
  }

  showSchemaTypeSelection(schemas) {
    log.silly(schemas);
    this.setState({
      createDialogSchemas: schemas,
      createDialogShow: true
    });
  }

  render() {
    const { createDialogSchemas, createDialogShow } = this.state;

    return (
      <div>
        <ModalSelect
          show={createDialogShow}
          options={createDialogSchemas}
          okButtonLabel="Select"
          onSelect={this.onTypeSelect}
          onClose={this.onTypeSelectCancelled}
          title="Select resource type"
        />
      </div>
    );
  }
}
