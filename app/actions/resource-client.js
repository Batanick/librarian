import log from 'electron-log';

import {BrowserWindow} from 'electron';

import * as Events from '../constants/events'
import ResourceSystem from './resource-system';

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
    log.info("Creating resource");
  }

  addingResource() {
    log.info("Adding resource");
  }
}
