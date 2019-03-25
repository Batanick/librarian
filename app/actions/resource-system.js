import log from 'electron-log';

const schemaExt = ".schema.json";
const resExt = ".rs";

const idField = "$id";

const fs = require('fs');

export default class ResourceSystem {
  schemas: null;
  res: null;

  loadFolder(path) {
    this.schemas = {};
    this.res = {};

    log.info("Loading resource folder: " + path);

    this.loadSchemas(path + "\\types");
  }

  loadSchemas(schemaPath) {
    log.info("Loading schemas from: " + schemaPath);

    const dir = fs.readdirSync(schemaPath);

    let counter = 0;

    for (let filePath of dir) {
      if (filePath.endsWith(schemaExt)) {
        log.info("Loading template: " + filePath);

        const result = this.loadSchema(schemaPath + "\\" + filePath);
        log.info(result ? "Success" : "Fail!");

        counter++;
      }
    }

    log.info("Loaded " + counter + " schemas");
  }

  loadSchema(path) {
    const content = fs.readFileSync(path);
    const jsonContent = JSON.parse(content);
    const id = jsonContent[idField];

    if (!id) {
      log.error("Template:" + path + " don't specify resource template id");
      return false;
    }
    if (this.schemas[id]) {
      log.error("Duplicate schema with id: " + id);
      return false;
    }

    this.schemas[id] = jsonContent;
    return true;
  }
}
