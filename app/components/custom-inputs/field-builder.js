import React from 'react';

import * as Validators from './validators';
import BooleanField from './BooleanField';
import ResourceRef from './ResourceRef';
import StringField from './StringField';
import ArrayField from './ArrayField';

const log = require('electron-log');

export default function renderInput(
  key,
  fieldInfo,
  fieldData,
  errors,
  onChange,
  resId,
  renderContext
) {
  const { type } = fieldInfo;

  switch (type) {
    case 'array':
      return (
        <ArrayField
          id={key}
          value={fieldData}
          onChangeField={onChange}
          fieldInfo={fieldInfo}
          renderContext={renderContext}
          resourceId={resId}
        />
      );
    case 'string':
      return (
        <StringField
          id={key}
          type="string"
          defaultValue={fieldInfo.default}
          value={fieldData}
          onChangeField={onChange}
          errors={errors}
          dataValidators={[]}
        />
      );
    case 'integer':
      return (
        <StringField
          id={key}
          type="number"
          defaultValue={fieldInfo.default}
          value={fieldData}
          onChangeField={onChange}
          errors={errors}
          dataValidators={[Validators.IsInteger]}
        />
      );
    case 'number':
      return (
        <StringField
          id={key}
          type="number"
          defaultValue={fieldInfo.default}
          value={fieldData}
          onChangeField={onChange}
          errors={errors}
          dataValidators={[]}
        />
      );
    case 'boolean':
      return (
        <BooleanField
          id={key}
          type="checkbox"
          defaultValue={fieldInfo.default}
          value={fieldData}
          onChangeField={onChange}
        />
      );
    case 'ref':
      return (
        <ResourceRef
          id={key}
          value={fieldData}
          onChangeField={onChange}
          resourceId={resId}
          renderContext={renderContext}
          fieldInfo={fieldInfo}
          reference
        />
      );
    case 'object':
      return (
        <ResourceRef
          id={key}
          value={fieldData}
          onChangeField={onChange}
          resourceId={resId}
          renderContext={renderContext}
          fieldInfo={fieldInfo}
          reference={false}
        />
      );

    default:
      log.error(`Unable to render field of type: ${fieldInfo.type}`);
  }
}
