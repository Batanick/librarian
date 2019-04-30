// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ArrowDown, ArrowUp, Plus, X, ChevronDown, ChevronUp} from "@githubprimer/octicons-react";
import StringField from "./StringField";
import Col from "react-bootstrap/Col";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";
import Octicon from "@githubprimer/octicons-react";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";
import Form from "../ResourceForm";

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func
};

export default class ArrayField extends Component<Props> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
    };
  }

  update = e => {
    // const { id, onChangeField } = this.props;
    // const { checked } = e.target;
    // onChangeField(id, checked ? 'true' : 'false');
  };

  render() {
    const {defaultValue, value, id} = this.props;
    const {open} = this.state;
    return (
      <div>
        <Row>
          <Col>
            <label>
              3/5
            </label>
          </Col>
          <Col md="auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => this.setState({open: !open})}
              aria-controls="example-collapse-text"
              aria-expanded={open}
            >
              <Octicon icon={open ? ChevronUp : ChevronDown}/>
            </Button>
          </Col>

        </Row>
        <Collapse in={open}>
          <div className={"flex-nowrap"}>

            <Row noGutters>
              <Col>
                <StringField
                  id={"key"}
                  type="string"
                  defaultValue={"fieldInfo.default"}
                  value={"4424224"}
                  onChangeField={() => {
                  }}
                  errors={[]}
                  dataValidators={[]}
                />
              </Col>
              <Col md="auto">
                <ButtonToolbar>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                    }}
                  >
                    <Octicon size="small" icon={ArrowUp}/>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                    }}
                  >
                    <Octicon size="small" icon={ArrowDown}/>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                    }}
                  >
                    <Octicon size="small" icon={X}/>
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
            <Row>
              <Col>
              </Col>
              <Col md="auto">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                  }}
                >
                  <Octicon size="small" icon={Plus}/>
                </Button>
              </Col>
            </Row>
          </div>
        </Collapse>
      </div>
    );
  }
}
