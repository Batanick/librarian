import log from 'electron-log';

import * as Consts from '../constants/constants';

const uuid = require('uuid');
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

    log.info(`Loading resource folder: ${folderPath}`);

    this.loadSchemas(`${folderPath}\\types`);
    this.rootDirPath = folderPath;
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

  createResource(type, resourcePath) {
    const res = {};
    const resId = uuid.v4();
    res[Consts.FIELD_NAME_ID] = resId;
    res[Consts.FIELD_NAME_TYPE] = type;

    const content = JSON.stringify(res, null, 4);
    try {
      fs.writeFileSync(resourcePath, content, 'utf-8');
    } catch (e) {
      dialog.showErrorBox('Something went wrong', e);
      return null;
    }

    res[Consts.FIELD_NAME_NAME] = path
      .basename(resourcePath)
      .split('.')
      .slice(0, -1)
      .join('.');
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
}
