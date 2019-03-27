import { BrowserWindow } from 'electron';

import log from 'electron-log';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

import ResourceSystem from './resource-system';

const { dialog, ipcMain } = require('electron');

export default class ResourceClient {
  mainWindow: BrowserWindow;

  resourceSystem: ResourceSystem;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.resourceSystem = new ResourceSystem();

    ipcMain.on(Events.DIALOG_SCHEMA_TYPE_SELECTED, (event, arg) => {
      this.createResourceOfType(arg);
    });
  }

  switchFolder() {
    const path = dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    });
    if (!path) {
      return;
    }
    this.resourceSystem.loadFolder(path[0]);
    this.mainWindow.webContents.send(
      Events.WORKSPACE_UPDATE_SCHEMAS,
      this.resourceSystem.schemas
    );
  }

  loadDefaultFolder() {
    this.resourceSystem.loadFolder('./res');
    this.mainWindow.webContents.send(
      Events.WORKSPACE_UPDATE_SCHEMAS,
      this.resourceSystem.schemas
    );
  }

  createResource() {
    const schemaTypes = Object.keys(this.resourceSystem.schemas);
    this.mainWindow.webContents.send(
      Events.DIALOG_SELECT_SCHEMA_TYPE,
      schemaTypes
    );
  }

  createResourceOfType(type) {
    log.info(`Creating new resource of type: ${type}`);

    const schema = this.resourceSystem.schemas[type];
    if (!schema) {
      log.error(`Unknown schema: ${type}`);
      return;
    }

    const path = dialog.showSaveDialog({
      defaultPath: this.resourceSystem.path,
      filters: [{ name: 'Resources', extensions: [Consts.EXTENSION_RESOURCE] }]
    });
    if (!path) {
      return;
    }

    const created = this.resourceSystem.createResource(type, path);
    if (!created) {
      return;
    }

    log.silly(`New resource created: ${JSON.stringify(created)}`);
    this.mainWindow.webContents.send(Events.WORKSPACE_LOAD_RESOURCE, created);
  }
}
