// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

import * as Consts from '../constants/constants';
import renderInput from './custom-inputs/field-builder';

const log = require('electron-log');

type Props = {
  // not used, but needed to force component rerender on move
  left: PropTypes.number /* eslint-disable-line react/no-unused-prop-types */,
  top: PropTypes.number /* eslint-disable-line react/no-unused-prop-types */,

  name: PropTypes.string,
  resId: PropTypes.string,
  dirty: PropTypes.bool,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  selected: PropTypes.bool,
  errors: PropTypes.obj,
  renderContext: PropTypes.obj,
  nested: PropTypes.bool,
  orphan: PropTypes.bool
};

export default class ResourceForm extends PureComponent<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.target = React.createRef();
  }

  getTypeName = () => {
    const { schema } = this.props;
    return schema[Consts.FIELD_NAME_ID];
  };

  renderHeader = () => {
    const { name, resId, dirty, nested } = this.props;
    const typeName = this.getTypeName();
    if (nested) {
      return (
        <Card.Header>
          <h6 className="card-subtitle text-muted">{typeName}</h6>
        </Card.Header>
      );
    }

    return (
      <Card.Header>
        <h5>{dirty ? `${name}*` : name}</h5>
        <h6 className="card-subtitle text-muted">{resId}</h6>
      </Card.Header>
    );
  };

  onChange = (field, fieldValue, errors, skipDirty) => {
    const { renderContext, resId } = this.props;
    renderContext.onDataChange(resId, field, fieldValue, errors, skipDirty);
  };

  render() {
    const {
      schema,
      data,
      selected,
      errors,
      nested,
      orphan,
      renderContext,
      resId
    } = this.props;
    const { properties } = schema;
    log.silly(`Rendering: ${resId}`);

    let border = 'info';
    if (selected) {
      border = 'warning';
    } else if (orphan) {
      border = 'danger';
    } else if (!nested) {
      border = 'success';
    }

    return (
      <Card
        ref={this.target}
        style={{ borderWidth: '2px', userSelect: 'none' }}
        border={border}
        role="presentation"
      >
        {this.renderHeader()}

        <Card.Body className="card-body">
          <Form>
            {properties.map(fieldInfo => {
              const key = fieldInfo.name;
              const fieldData = data[key];
              const fieldErrors = errors ? errors[key] : null;

              return (
                <Form.Row key={`input-row-${key}`}>
                  <Form.Label key={`input-label-${key}`} column sm={4}>
                    {fieldInfo.title}
                  </Form.Label>
                  <Col key={`input-col-${key}`}>
                    {renderInput(
                      key,
                      fieldInfo,
                      fieldData,
                      fieldErrors,
                      this.onChange,
                      resId,
                      renderContext
                    )}
                  </Col>
                </Form.Row>
              );
            })}
          </Form>
        </Card.Body>
      </Card>
    );
  }
}
