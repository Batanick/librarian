// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import update from 'immutability-helper';
// noinspection ES6CheckImport
import Octicon, {
  FileSymlinkFile,
  Eye,
  Plus,
  X
} from '@githubprimer/octicons-react';

import SvgConnector from './SvgConnector';
import ResourceSelectOverlay from './ResourceSelectOverlay';
import ModalSelect from '../ModalSelect';

import * as Consts from '../../constants/constants';

const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  renderContext: PropTypes.obj,
  fieldInfo: PropTypes.obj,
  reference: PropTypes.bool,
  overridingConnector: PropTypes.obj
};

const labelStyles = {
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  wordwrap: false,
  maxWidth: '150px'
};

export default class ResourceRef extends Component<Props> {
  static calculateConnector(target, resourceInfo) {
    const {current} = target;
    if (current == null) {
      log.warn("Unable to calculate connector");
      return null;
    }

    const box = current.getBoundingClientRect();
    const scrollable = document.getElementById('scrollableWorkspace');

    return {
      x: resourceInfo.left + resourceInfo.width - 15,
      y: box.top + box.height / 2 + scrollable.scrollTop
    };
  }

  constructor(...args) {
    super(...args);

    this.target = React.createRef();

    this.state = {
      selecting: false,
      creatingNew: false
    };
  }

  componentDidUpdate() {
    const {value, reference, resourceId, id, renderContext} = this.props;
    if (!reference) {
      if (value) {
        // if value resource disappeared - updating
        if (!renderContext.getResourceInfo(value)) {
          log.warn(`Fixing value for ${resourceId}/${id}`);
          this.update(null);
        }
      }
    }
  }

  update = newValue => {
    const {
      id,
      onChangeField,
      renderContext,
      resourceId,
      value,
      reference
    } = this.props;
    onChangeField(id, newValue);

    if (reference || value === newValue) {
      return;
    }

    // nesting reference handling only
    if (value != null) {
      renderContext.changeParent(value, null);
    }

    if (newValue != null) {
      renderContext.changeParent(newValue, resourceId);
    }
  };

  renderLink(targetInfo) {
    const connector = this.getConnector();
    if (!connector) {
      return;
    }

    log.error(JSON.stringify(connector));

    const {left, top, height} = targetInfo;
    if (!left || !top || !height) {
      return null;
    }

    return (
      <SvgConnector
        start={{x: connector.x, y: connector.y}}
        finish={{x: left, y: top + height / 2}}
      />
    );
  }

  getConnector() {
    const {renderContext, resourceId, overridingConnector} = this.props;

    if (overridingConnector != null) {
      return overridingConnector;
    }

    return ResourceRef.calculateConnector(this.target, renderContext.getResourceInfo(resourceId));
  }

  loadResource = resId => {
    const {renderContext, resourceId} = this.props;
    const opt = {};

    const selfInfo = renderContext.getResourceInfo(resourceId);
    if (selfInfo) {
      opt.left = selfInfo.left + selfInfo.width + 50;
      opt.top = selfInfo.top;
    }

    renderContext.loadResourceById(resId, opt);
  };

  deleteRef = () => {
    this.update(undefined);
  };

  onStartSelect = () => {
    this.setState(prevState =>
      update(prevState, {
        selecting: {$set: true}
      })
    );
  };

  onCreateNew = () => {
    this.setState(prevState =>
      update(prevState, {
        creatingNew: {$set: true}
      })
    );
  };

  onSelect = (x, y) => {
    const resId = this.canConnect(x, y);
    if (resId) {
      this.update(resId);
    }

    this.onSelectCancel();
  };

  onSelectCancel = () => {
    this.setState(prevState =>
      update(prevState, {
        selecting: {$set: false}
      })
    );
  };

  onCreateCancel = () => {
    this.setState(prevState =>
      update(prevState, {
        creatingNew: {$set: false}
      })
    );
  };

  onTypeSelected = type => {
    this.onCreateCancel();
    if (!type) {
      return;
    }

    const {renderContext, resourceId} = this.props;

    const value = {
      [Consts.FIELD_NAME_TYPE]: type
    };
    const refId = renderContext.createNested(resourceId, type, value);
    this.update(refId);
  };

  canConnect = (x, y) => {
    const {renderContext, fieldInfo, resourceId, reference} = this.props;

    const resId = renderContext.findResourceAt(x, y);
    if (!resId || resourceId === resId) {
      return null;
    }

    const resource = renderContext.getResourceInfo(resId);
    if (!resource || !resource.type) {
      return null;
    }

    if (reference === resource.nested) {
      return null;
    }

    if (!reference && resource.parent) {
      return null;
    }

    const {allowedTypes} = fieldInfo;
    const schemaId = resource.type;
    if (!allowedTypes || !allowedTypes.includes(schemaId)) {
      return null;
    }

    return resId;
  };

  renderSelectOverlay() {
    const {selecting} = this.state;
    if (!selecting) {
      return;
    }

    const connector = this.getConnector();
    return (
      <ResourceSelectOverlay
        start={connector}
        onSelect={this.onSelect}
        onCancel={this.onSelectCancel}
        canConnect={this.canConnect}
      />
    );
  }

  renderTypeSelect() {
    const {creatingNew} = this.state;
    if (!creatingNew) {
      return;
    }

    const {fieldInfo} = this.props;
    let {allowedTypes} = fieldInfo;
    if (!allowedTypes) {
      allowedTypes = [];
    }

    return (
      <ModalSelect
        okButtonLabel="Create"
        onClose={this.onCreateCancel}
        onSelect={this.onTypeSelected}
        options={allowedTypes}
        show
        title="Select type to create"
      />
    );
  }

  renderField() {
    const {value, renderContext} = this.props;

    if (value == null) {
      return (
        <div>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.onCreateNew()}
          >
            <Octicon size="small" icon={Plus}/>
          </Button>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.onStartSelect()}
          >
            <Octicon size="small" icon={FileSymlinkFile}/>
          </Button>
          {this.renderSelectOverlay()}
          {this.renderTypeSelect()}
        </div>
      );
    }

    const info = renderContext.getResourceInfo(value);
    if (info == null) {
      return (
        <div>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.deleteRef(value)}
          >
            <Octicon size="small" icon={X}/>
          </Button>
          <Button
            className="btn btn-secondary btn-sm"
            onClick={() => this.loadResource(value)}
          >
            <Octicon size="small" icon={Eye}/>
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
          <Octicon size="small" icon={X}/>
        </Button>
        {this.renderLink(info)}
      </div>
    );
  }

  render() {
    const {value} = this.props;

    return (
      <div ref={this.target}>
        <Row lg="auto">
          <Form.Label
            column
            className="overflow-hidden"
            style={Object.assign({}, labelStyles)}
          >
            {value}
          </Form.Label>
          <Col lg="auto"> {this.renderField()}</Col>
        </Row>
      </div>
    );
  }
}
