// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ArrowDown, ArrowUp, Plus, X} from "@githubprimer/octicons-react";
import StringField from "./StringField";
import Col from "react-bootstrap/Col";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";
import Octicon from "@githubprimer/octicons-react";
import Row from "react-bootstrap/Row";

// const log = require('electron-log');

type Props = {
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func
};

export default class ArrayField extends Component<Props> {
  update = e => {
    // const { id, onChangeField } = this.props;
    // const { checked } = e.target;
    // onChangeField(id, checked ? 'true' : 'false');
  };

  render() {
    const {defaultValue, value, id} = this.props;
    return (
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
    );
  }
}
