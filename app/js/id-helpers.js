export function getNestedId(resId, fieldName) {
  return `${resId}/${fieldName}`;
}

export function getNestedArrayId(resId, fieldName, index) {
  return `${resId}/${fieldName}[${index}]`;
}

export function getParentId(resId) {
  return resId.split('/')[0];
}

/* eslint no-param-reassign: ["error", { "props": false }] */
export function replaceParent(obj, oldId, newId, orphanFlag) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (key.startsWith(oldId)) {
      const newKey = key.replace(oldId, newId);
      const res = obj[key];
      res.orphan = orphanFlag;

      delete obj[key];
      obj[newKey] = res;
    }
  }
}
