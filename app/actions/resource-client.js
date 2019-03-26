import { BrowserWindow } from 'electron';

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
      Events.UPDATE_SCHEMAS,
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
    const path = dialog.showSaveDialog({
      defaultPath: this.resourceSystem.path,
      filters: [{ name: 'Resources', extensions: [Consts.EXTENSION_RESOURCE] }]
    });
    if (!path) {
      return;
    }

    this.resourceSystem.createResource(type, path);
  }
}
