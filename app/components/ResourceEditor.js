// @flow
import React, {Component} from 'react';

import Workspace from './Workspace';
import ModalSelect from './ModalSelect';
import * as Events from '../constants/events'

import PropTypes from "prop-types";

const log = require('electron-log');
const {ipcRenderer} = window.require('electron');

type Props = {};

export default class ResourceEditor extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
    this.state = {
      schemas: {}
    };
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.UPDATE_SCHEMAS, (event, arg) => {
      selfThis.loadSchemas(arg)
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.UPDATE_SCHEMAS);
  }

  loadSchemas(schemas) {
    log.silly(schemas);

    this.setState({
        schemas: schemas
      }
    );
  }

  render() {
    return (
      <div>
        <Workspace connectDropTarget={{}}/>
        <ModalSelect show={false} options={[]}/>
      </div>
    );
  }
}
