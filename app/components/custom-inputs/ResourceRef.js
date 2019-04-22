// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import SvgConnector from "./SvgConnector";

import * as Consts from '../../constants/constants';

const log = require('electron-log');


type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  renderContext: PropTypes.obj
};

const labelStyles = {
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  wordwrap: false,
  width: "100px"
};

export default class ResourceRef extends Component<Props> {
  constructor(...args) {
    super(...args);

    this.target = React.createRef();
  }

  update = value => {
    // if (value == null || value === "") {
    //   return;
    // }
    // const {overlayContext, onChangeField} = this.props;
    // overlayContext.registerLink(this.getId(), value);
    // onChangeField(id, value, [], false);
  };

  getId() {
    const {id, resourceId} = this.props;
    return `${resourceId}_${id}`;
  }

  renderLink(targetInfo) {
    const current = this.target.current;
    if (!current) {
      log.error("No connector coordinates");
      return;
    }
    const box = current.getBoundingClientRect();
    const connector = {x: box.right, y: (box.top + box.height / 2)};

    const {left, top, height} = targetInfo;
    return (
      <SvgConnector 
                    start={{x: connector.x, y : connector.y}}
                    finish={{x: left, y: top + (height / 2)}}
                    selectionMode={false} />
    )
  }

  focusOnResource = (resId) => {

  };

  renderField() {
    const {value, renderContext} = this.props;

    if (value == null) {
      log.error("Render selection of new");
    } else {
      const info = renderContext.getResourceInfo(value);
      log.error(info);
      if (info == null) {
        log.error("Load resource:" + value);
      } else {
        log.error("Draw link");

        return (<div>
          <Button className="btn btn-secondary btn-sm" onClick={this.focusOnResource(value)}> → </Button>
          {this.renderLink(info)}
        </div>);
      }
    }
  }

  render() {
    const {value} = this.props;

    return (<div ref={this.target}>
        <Row>
          <Col>
            <label className={"overflow-hidden"} style={Object.assign({}, labelStyles)}>{value}</label>
          </Col>
          <Col sm={"auto"}> {this.renderField()}</Col>
        </Row>
      </div>
    );
  }
}
