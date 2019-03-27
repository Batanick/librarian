import log from 'electron-log';

import * as Consts from '../constants/constants';

const idField = '$id';
const fs = require('fs');

const { dialog } = require('electron');

export default class ResourceSystem {
  schemas: null;

  resources: null;

  path: null;

  loadFolder(path) {
    this.schemas = {};
    this.resources = {};

    log.info(`Loading resource folder: ${path}`);

    this.loadSchemas(`${path}\\types`);
    this.path = path;
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

  loadSchema(path) {
    const content = fs.readFileSync(path);
    const jsonContent = JSON.parse(content);
    const id = jsonContent[idField];

    if (!id) {
      log.error(`Template:${path} don't specify resource template id`);
      return false;
    }
    if (this.schemas[id]) {
      log.error(`Duplicate schema with id: ${id}`);
      return false;
    }

    this.schemas[id] = jsonContent;
    return true;
  }

  createResource(type, path) {
    const res = {};
    const resId = Math.floor(Math.random() * 1000000); // TODO: have proper solution here
    res[Consts.FIELD_NAME_ID] = resId;
    res[Consts.FIELD_NAME_TYPE] = type;

    const content = JSON.stringify(res, null, 4);
    try {
      fs.writeFileSync(path, content, 'utf-8');
    } catch (e) {
      dialog.showErrorBox('Something went wrong', e);
      return null;
    }

    this.resources[resId] = res;
    return res;
  }
}
