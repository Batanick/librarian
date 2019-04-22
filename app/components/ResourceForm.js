// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

import StringField from './custom-inputs/StringField';
import BooleanField from './custom-inputs/BooleanField';

import * as Validators from './custom-inputs/validators';
import ResourceRef from './custom-inputs/ResourceRef';

const log = require('electron-log');

type Props = {
  name: PropTypes.string,
  resId: PropTypes.string,
  dirty: PropTypes.bool,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.fun,
  selected: PropTypes.bool,
  errors: PropTypes.obj,
  renderContext: PropTypes.obj
};

export default class ResourceForm extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);

    this.target = React.createRef();
  }

  componentDidMount(): void {
    const { renderContext, resId } = this.props;
    const box = this.target.current.getBoundingClientRect();

    renderContext.registerSize(resId, box.width, box.height);
  }

  renderInput(key, fieldInfo, fieldData, errors) {
    const { onChange, renderContext, resId } = this.props;

    switch (fieldInfo.type) {
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
          />
        );

      default:
        log.error(`Unable to render field of type: ${fieldInfo.type}`);
    }
  }

  render() {
    const { name, resId, dirty, schema, data, selected, errors } = this.props;
    // log.silly(`Rendering: ${resId}`);
    return (
      <Card
        ref={this.target}
        style={{ borderWidth: '2px' }}
        border={selected ? 'warning' : 'primary'}
        role="presentation"
      >
        <Card.Header>
          <h5>{dirty ? `${name}*` : name}</h5>
          <h6 className="card-subtitle text-muted">{resId}</h6>
        </Card.Header>

        <Card.Body className="card-body">
          <Form>
            {Object.keys(schema.properties).map(key => {
              const fieldInfo = schema.properties[key];
              const fieldData = data[key];
              const fieldErrors = errors ? errors[key] : null;

              return (
                <Form.Row key={`input-row-${key}`}>
                  <Form.Label key={`input-label-${key}`} column sm={4}>
                    {fieldInfo.title}
                  </Form.Label>
                  <Col key={`input-col-${key}`}>
                    {this.renderInput(key, fieldInfo, fieldData, fieldErrors)}
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
