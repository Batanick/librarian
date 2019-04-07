import { BrowserWindow } from 'electron';

import log from 'electron-log';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

import ResourceSystem from './resource-system';

const { dialog, ipcMain } = require('electron');
const ProgressBar = require('electron-progressbar');

export default class ResourceClient {
  mainWindow: BrowserWindow;

  resourceSystem: ResourceSystem;

  progressBar: null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.resourceSystem = new ResourceSystem();

    ipcMain.on(Events.DIALOG_SCHEMA_TYPE_SELECTED, (event, arg) => {
      this.createResourceOfType(arg);
    });

    ipcMain.on(Events.WORKSPACE_READY, () => {
      if (this.resourceSystem.schemas) {
        this.mainWindow.webContents.send(
          Events.WORKSPACE_UPDATE_SCHEMAS,
          this.resourceSystem.schemas
        );
      }
    });

    ipcMain.on(Events.WORKSPACE_SAVE_ALL_DIRTY, (event, arg) => {
      this.saveAllResources(arg);
    });

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.loadDefaultFolder();
    }
  }

  switchFolder() {
    const path = dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    });
    if (!path) {
      return;
    }
    ResourceClient.executeModal(
      this.mainWindow,
      `Loading folder: ${path}`,
      'Loading resources',
      () => {
        this.resourceSystem.loadFolder(path[0]);
      }
    );

    this.mainWindow.webContents.send(
      Events.WORKSPACE_UPDATE_SCHEMAS,
      this.resourceSystem.schemas
    );
  }

  loadDefaultFolder() {
    ResourceClient.executeModal(
      this.mainWindow,
      'Loading default folder',
      'Loading resources',
      () => {
        this.resourceSystem.loadFolder('./res');
        this.mainWindow.webContents.send(
          Events.WORKSPACE_UPDATE_SCHEMAS,
          this.resourceSystem.schemas
        );
      }
    );
  }

  createResource() {
    const schemaTypes = Object.keys(this.resourceSystem.schemas);
    this.mainWindow.webContents.send(
      Events.DIALOG_SELECT_SCHEMA_TYPE,
      schemaTypes
    );
  }

  saveAll() {
    this.progressBar = new ProgressBar({
      text: 'Saving all dirty resources...',
      detail: 'Saving...',
      browserWindow: {
        parent: this.mainWindow
      }
    });

    this.mainWindow.webContents.send(Events.WORKSPACE_SAVE_ALL_DIRTY);
  }

  saveAllResources(resources) {
    const resSystem = this.resourceSystem;
    Object.keys(resources).forEach(key => {
      resSystem.saveResource(resources[key]);
    });

    this.mainWindow.webContents.send(
      Events.WORKSPACE_RESOURCES_SAVED,
      Object.keys(resources)
    );

    this.progressBar.close();
    this.progressBar = null;
  }

  createResourceOfType(type) {
    log.info(`Creating new resource of type: ${type}`);

    const schema = this.resourceSystem.schemas[type];
    if (!schema) {
      log.error(`Unknown schema: ${type}`);
      return;
    }

    const path = dialog.showSaveDialog({
      defaultPath: this.resourceSystem.rootDirPath,
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

  static executeModal(mainWindow, text, detail, action) {
    const progressBar = new ProgressBar({
      text,
      detail,
      browserWindow: {
        parent: mainWindow
      }
    });

    try {
      action();
    } catch (e) {
      log.error(e);
      dialog.showErrorBox('Something went wrong', e);
    }

    progressBar.close();
  }
}
