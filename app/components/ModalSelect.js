// @flow
import React, {Component} from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from "react-bootstrap/Button";

import PropTypes from "prop-types";

type Props = {
  options : PropTypes.array;
  show : PropTypes.bool;
};

export default class ModalSelect extends Component<Props> {
  props: Props;

  constructor(...args) {
    super(args);
  }

  handleClose() {
  }

  handleShow() {
  }

  render() {
    const show = this.props.show;
    const options = this.props.options;

    return (
      <Modal show={show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
