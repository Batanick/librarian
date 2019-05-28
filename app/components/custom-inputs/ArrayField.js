// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Collapse from 'react-bootstrap/Collapse';
import update from 'immutability-helper';

// noinspection ES6CheckImport
import Octicon, {
  ArrowDown,
  ArrowUp,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from '@githubprimer/octicons-react';

import * as JsonUtils from '../../js/js-utils';

import renderInput from './field-builder';
import ResourceRef from './ResourceRef';

type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  renderContext: PropTypes.obj,
  fieldInfo: PropTypes.obj
};

export default class ArrayField extends Component<Props> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      version: 0
    };

    this.target = React.createRef();
  }

  update = e => {
    const { id, onChangeField } = this.props;
    onChangeField(id, e);
  };

  onElementChange = (index, elValue) => {
    const { value } = this.props;
    const copy = JsonUtils.clone(value);
    copy[index] = elValue;
    this.update(copy);
  };

  renderField = (key, index, shown) => {
    const { renderContext, fieldInfo, value, resourceId } = this.props;
    const elementsInfo = fieldInfo.elements;

    const overrideConnector = shown
      ? null
      : ResourceRef.calculateConnector(
          this.target,
          renderContext.getResourceInfo(resourceId)
        );

    const selfThis = this;
    const changeHandler = function onChange(id, e) {
      selfThis.onElementChange(index, e);
    };

    return renderInput(
      key,
      elementsInfo,
      value[index],
      [],
      changeHandler,
      resourceId,
      renderContext,
      overrideConnector
    );
  };

  renderArray(actualValue, shown) {
    const { version } = this.state;
    const selfThis = this;

    return actualValue.map((element, index) => {
      const deleteWrapper = function del() {
        selfThis.removeElement(index);
      };

      const key = `${version}-${index}`;

      return (
        <Row>
          <div
            key={key}
            style={{
              flexWrap: 'nowrap',
              display: 'inline-flex',
              marginLeft: 'auto',
              marginRight: '15px'
            }}
          >
            {this.renderField(key, index, shown)}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.swap(index, index - 1);
              }}
            >
              <Octicon size="small" icon={ArrowUp} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.swap(index, index + 1);
              }}
            >
              <Octicon size="small" icon={ArrowDown} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                deleteWrapper();
              }}
            >
              <Octicon size="small" icon={X} />
            </Button>
          </div>
        </Row>
      );
    });
  }

  addElement = () => {
    const { value } = this.props;
    if (value == null) {
      this.update([null]);
      return;
    }

    const copy = JsonUtils.clone(value);
    copy.push(null);
    this.bumpVersion();
    this.update(copy);
  };

  removeElement = index => {
    const { value } = this.props;
    value.splice(index, 1);
    this.bumpVersion();
    this.update(value);
  };

  swap = (index1, index2) => {
    const { value } = this.props;
    if (value[index1] === undefined || value[index2] === undefined) {
      return;
    }

    const copy = JsonUtils.clone(value);
    const tmp = copy[index1];
    copy[index1] = copy[index2];
    copy[index2] = tmp;

    this.update(copy);
    this.bumpVersion();
  };

  bumpVersion = () => {
    this.setState(prevState =>
      update(prevState, {
        version: {
          $apply: function inc(obj) {
            return obj + 1;
          }
        }
      })
    );
  };

  render() {
    const { value, resourceId } = this.props;
    const actualValue = value == null ? [] : value;

    let elementsCount = 0;
    for (let i = 0; i < actualValue.length; i += 1) {
      if (actualValue[i] != null) {
        elementsCount += 1;
      }
    }

    const labelId = `label-${resourceId}-id`;
    const { open } = this.state;
    return (
      <div ref={this.target}>
        <Row noGutters>
          <Col />
          <Col md="auto">
            <label className="p-1 text-muted" htmlFor={labelId}>
              {' '}
              {/* eslint-disable-line jsx-a11y/label-has-for */}
              {elementsCount}/{actualValue.length}
            </label>
            <Button
              id={labelId}
              variant="outline-secondary"
              size="sm"
              onClick={() => this.setState({ open: !open })}
              aria-controls="example-collapse-text"
              aria-expanded={open}
            >
              <Octicon icon={open ? ChevronUp : ChevronDown} />
            </Button>
          </Col>
        </Row>
        <Collapse in={open}>
          <div className="flex-nowrap" style={{ minWidth: '200px' }}>
            {this.renderArray(actualValue, open)}
            <Row>
              <Col />
              <Col md="auto">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    this.addElement();
                  }}
                >
                  <Octicon size="small" icon={Plus} />
                </Button>
              </Col>
            </Row>
          </div>
        </Collapse>
      </div>
    );
  }
}
