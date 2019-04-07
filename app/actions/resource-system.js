import log from 'electron-log';

import * as Consts from '../constants/constants';
import * as Utils from './utils/file-utils';

const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');

const { dialog } = require('electron');

export default class ResourceSystem {
  schemas: null;

  resources: null;

  rootDirPath: null;

  loadFolder(folderPath) {
    this.schemas = {};
    this.resources = {};
    this.rootDirPath = folderPath;

    log.info(`Loading resource folder: ${folderPath}`);

    this.loadSchemas(`${folderPath}\\types`);
    this.loadResources(folderPath);
  }

  loadSchemas(schemaPath) {
    log.info(`Loading schemas from: ${schemaPath}`);

    const dir = fs.readdirSync(schemaPath);

    let counter = 0;

    const size = dir.length;
    for (let i = 0; i < size; i += 1) {
      const filePath = dir[i];
      if (filePath.endsWith(Consts.EXTENSION_SCHEMA)) {
        log.info(`Loading template: ${filePath}`);

        const result = this.loadSchema(`${schemaPath}\\${filePath}`);
        log.info(result ? 'Success' : 'Fail!');

        counter += 1;
      }
    }

    log.info(`Loaded ${counter} schemas`);
  }

  loadSchema(schemaPath) {
    const content = fs.readFileSync(schemaPath);
    const jsonContent = JSON.parse(content);
    const id = jsonContent[Consts.FIELD_NAME_ID];

    if (!id) {
      log.error(`Template:${schemaPath} don't specify resource template id`);
      return false;
    }
    if (this.schemas[id]) {
      log.error(`Duplicate schema with id: ${id}`);
      return false;
    }

    this.schemas[id] = jsonContent;
    return true;
  }

  loadResources(folderPath) {
    const files = Utils.searchDir(folderPath, fileName =>
      fileName.endsWith(Consts.EXTENSION_RESOURCE)
    );

    const size = files.length;
    for (let i = 0; i < size; i += 1) {
      const res = this.loadResource(files[i]);
      if (!res) {
        log.error(`Unable to load resource file: ${res}`);
      }
    }
  }

  loadResource(resourcePath) {
    try {
      const content = fs.readFileSync(resourcePath, 'utf-8');
      const res = JSON.parse(content);

      res[Consts.FIELD_NAME_PATH] = resourcePath;
      res[Consts.FIELD_NAME_NAME] = ResourceSystem.extractResourceName(
        resourcePath
      );

      const id = res[Consts.FIELD_NAME_ID];
      const type = res[Consts.FIELD_NAME_TYPE];

      if (this.resources[id]) {
        log.error(`Duplicate id: ${id}`);
        return null;
      }

      if (!this.schemas[type]) {
        log.error(`Unknown resource type: ${type}, resource: ${resourcePath}`);
        return null;
      }

      this.resources[id] = res;

      return res;
    } catch (e) {
      dialog.showErrorBox(`Unable to load resource: ${resourcePath}`, e);
      return null;
    }
  }

  createResource(type, resourcePath) {
    const res = {};
    const resId = uuid();
    res[Consts.FIELD_NAME_ID] = resId;
    res[Consts.FIELD_NAME_TYPE] = type;

    const content = JSON.stringify(res, null, 4);
    try {
      fs.writeFileSync(resourcePath, content, 'utf-8');
    } catch (e) {
      dialog.showErrorBox('Something went wrong', e);
      return null;
    }

    res[Consts.FIELD_NAME_NAME] = ResourceSystem.extractResourceName(
      resourcePath
    );
    res[Consts.FIELD_NAME_PATH] = resourcePath;

    this.resources[resId] = res;
    return res;
  }

  saveResource(res) {
    const filePath = res[Consts.FIELD_NAME_PATH];
    const resId = res[Consts.FIELD_NAME_ID];

    const objectToSave = Object.assign({}, res);

    // removing fields that we generating on the fly
    delete objectToSave[Consts.FIELD_NAME_PATH];
    delete objectToSave[Consts.FIELD_NAME_NAME];

    const content = JSON.stringify(objectToSave, null, 4);

    log.info(
      `Updating resource ${resId}: ${JSON.stringify(res)} (${filePath})`
    );

    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (e) {
      dialog.showErrorBox('Something went wrong', e);
      return null;
    }

    this.resources[resId] = res;
    return res;
  }

  static extractResourceName(filePath) {
    return path
      .basename(filePath)
      .split('.')
      .slice(0, -1)
      .join('.');
  }
}
