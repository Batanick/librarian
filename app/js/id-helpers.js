export function getNestedId(resId, fieldName) {
    return `${resId}/${fieldName}`
}

export function getNestedArrayId(resId, fieldName, index) {
  return `${resId}/${fieldName}[${index}]`;
}
