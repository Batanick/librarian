const uuid = require('uuid/v4');

export function clone(obj) {
  if (obj == null) {
    return null;
  }

  // does not feel right, but stackoverflow suggest :/
  return JSON.parse(JSON.stringify(obj));
}

export function generateUUID() {
  return uuid();
}
