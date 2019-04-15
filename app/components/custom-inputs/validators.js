export const IsInteger = str => {
  const regexp = /^[0-9]+([,.][0-9]+)?$/g;
  if (!regexp.test(str)) {
    return 'Invalid integer value';
  }
  return null;
};

export const IsEmpty = str => {
  if (str == null || str === '') {
    return 'Cannot be empty';
  }

  return null;
};
