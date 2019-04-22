// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import SvgConnector from './SvgConnector';

const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  renderContext: PropTypes.obj
};

const labelStyles = {
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  wordwrap: false,
  width: '100px'
};

export default class ResourceRef extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.target = React.createRef();
  }

  update = value => {
    const { id, onChangeField } = this.props;
    onChangeField(id, value);
  };

  getId() {
    const { id, resourceId } = this.props;
    return `${resourceId}_${id}`;
  }

  renderLink(targetInfo) {
    const { current } = this.target;
    if (!current) {
      log.error('No connector coordinates');
      return;
    }
    const box = current.getBoundingClientRect();
    const connector = { x: box.right, y: box.top + box.height / 2 };

    const { left, top, height } = targetInfo;
    return (
      <SvgConnector
        start={{ x: connector.x, y: connector.y }}
        finish={{ x: left, y: top + height / 2 }}
      />
    );
  }

  loadResource = resId => {
    const { renderContext, resourceId } = this.props;
    const opt = {};

    const selfInfo = renderContext.getResourceInfo(resourceId);
    if (selfInfo) {
      opt.pos = {
        left: selfInfo.left + selfInfo.width + 50,
        top: selfInfo.top
      };
    }

    renderContext.loadResourceById(resId, opt);
  };

  deleteRef = () => {
    log.error('Cleaning value');
    this.update(null);
  };

  renderField() {
    const { value, renderContext } = this.props;

    if (value == null) {
      log.error('Render selection of new');
    } else {
      const info = renderContext.getResourceInfo(value);
      if (info == null) {
        return (
          <div>
            <Button
              className="btn btn-secondary btn-sm"
              onClick={() => this.deleteRef(value)}
            >
              {' '}
              X{' '}
            </Button>
            <Button
              className="btn btn-secondary btn-sm"
              onClick={() => this.loadResource(value)}
            >
              {' '}
              →{' '}
            </Button>
          </div>
        );
      }

      return (
        <div>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.deleteRef(value)}
          >
            {' '}
            X{' '}
          </Button>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.loadResource(value)}
          >
            {' '}
            →{' '}
          </Button>
          {this.renderLink(info)}
        </div>
      );
    }
  }

  render() {
    const { value } = this.props;

    return (
      <div ref={this.target}>
        <Row>
          <Col>
            <h6
              className="overflow-hidden"
              style={Object.assign({}, labelStyles)}
            >
              {value}
            </h6>
          </Col>
          <Col sm="auto"> {this.renderField()}</Col>
        </Row>
      </div>
    );
  }
}
