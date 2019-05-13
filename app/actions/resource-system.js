import log from 'electron-log';

import * as Consts from '../constants/constants';
import * as Utils from './utils/file-utils';

const uuid = require('uuid/v4');
const fs = require('fs');

const { dialog } = require('electron');

export default class ResourceSystem {
  schemas: null;

  resources: null;

  rootDirPath: null;

  index: null;

  loadFolder(folderPath) {
    this.schemas = {};
    this.resources = {};
    this.index = {};
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

  static loadResourceFromFile(resourcePath) {
    log.info(`Loading: ${resourcePath}`);
    try {
      const content = fs.readFileSync(resourcePath, 'utf-8');
      const res = JSON.parse(content);

      res[Consts.FIELD_NAME_PATH] = resourcePath;
      res[Consts.FIELD_NAME_NAME] = Utils.extractFileName(resourcePath);

      return res;
    } catch (e) {
      log.error(e);
      dialog.showErrorBox(`Unable to load resource: ${resourcePath}`, e);
      return null;
    }
  }

  loadResource(resourcePath, ignoreDuplicates) {
    const res = ResourceSystem.loadResourceFromFile(resourcePath);
    if (!res) {
      return null;
    }

    const id = res[Consts.FIELD_NAME_ID];
    const type = res[Consts.FIELD_NAME_TYPE];

    if (!ignoreDuplicates && this.resources[id]) {
      log.error(`Duplicate id: ${id}`);
      return null;
    }

    if (!this.schemas[type]) {
      log.error(`Unknown resource type: ${type}, resource: ${resourcePath}`);
      return null;
    }

    this.register(res);
    return res;
  }

  createResource(type, resourcePath) {
    const res = {};
    res[Consts.FIELD_NAME_ID] = uuid();
    res[Consts.FIELD_NAME_TYPE] = type;

    const content = JSON.stringify(res, null, 4);
    try {
      fs.writeFileSync(resourcePath, content, 'utf-8');
    } catch (e) {
      dialog.showErrorBox('Something went wrong', e);
      return null;
    }

    res[Consts.FIELD_NAME_NAME] = Utils.extractFileName(resourcePath);
    res[Consts.FIELD_NAME_PATH] = resourcePath;

    this.register(res);
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

    this.register(res);
    return res;
  }

  register(res) {
    const resId = res[Consts.FIELD_NAME_ID];

    const indexRecord = {};
    indexRecord[Consts.FIELD_NAME_PATH] = res[Consts.FIELD_NAME_PATH];
    indexRecord[Consts.FIELD_NAME_NAME] = res[Consts.FIELD_NAME_NAME];
    indexRecord[Consts.FIELD_NAME_TYPE] = res[Consts.FIELD_NAME_TYPE];

    this.index[resId] = indexRecord;
    this.resources[resId] = res;
  }
}
