import log from 'electron-log';

import {BrowserWindow} from 'electron';

import * as Events from '../constants/events'
import * as Consts from '../constants/constants'

import ResourceSystem from './resource-system';
import React from "react";

const {dialog} = require('electron');

export default class ResourceClient {
  mainWindow: BrowserWindow;
  resourceSystem: ResourceSystem;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.resourceSystem = new ResourceSystem();
  }

  switchFolder() {
    const path = dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
    if (!path) {
      return;
    }
    this.resourceSystem.loadFolder(path[0]);
    this.mainWindow.webContents.send(Events.UPDATE_SCHEMAS, this.resourceSystem.schemas);
  }

  createResource() {
    let schemaTypes = Object.keys(this.resourceSystem.schemas);
    this.mainWindow.webContents.send(Events.DIALOG_SELECT_SCHEMA_TYPE, schemaTypes);
  }

  createResourceOfType(type) {
    const path = dialog.showSaveDialog({properties: ['openFile', 'openDirectory']});
    if (!path) {
      return;
    }

    const resId = Math.floor(Math.random() * 1000000); // TODO: have proper solution here

    const res = {};
    res[Consts.ID_FIELD_NAME] = resId;

    const content = JSON.stringify(res, null, 4);
    try {
      fs.writeFileSync(path, content, 'utf-8');
    } catch (e) {
      alert('Filed to create new resource');
      return;
    }

    this.resourceSystem.addNewResource(path, resId);
  }

  addingResource() {
    log.info("Adding resource");
  }
}
