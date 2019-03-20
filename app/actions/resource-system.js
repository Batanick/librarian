import log from 'electron-log';

const schemaExt = ".schema.json";
const resExt = ".rs";

const fs = require('fs');

export default class ResourceSystem {
  schemas: null;
  res: null;

  loadFolder(path) {
    log.info("Loading resource folder: " + path);

    this.loadSchemas(path + "\\types");
  }

  loadSchemas(schemaPath) {
    log.info("Loading schemas from: " + schemaPath);
    fs.readdir(schemaPath, (err, dir) => {
      for (let filePath of dir)
        if (filePath.endsWith(".js")) {
          this.loadSchema(schemaPath + "\\" + filePath)
        }

    });
  }

  loadSchema(path) {
    log.info("Loading template:" + path);
    const content = fs.readFileSync(path);
    const jsonContent = JSON.parse(content);
    log.debug(jsonContent);
  }
}
