// @flow
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import PropTypes from 'prop-types';

// const log = require('electron-log');

type Props = {
  options: PropTypes.array,
  show: PropTypes.bool,
  title: PropTypes.string,
  okButtonLabel: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func
};

export default class ModalSelect extends Component<Props> {
  props: Props;

  inputRef: null;

  constructor(...args) {
    super(args);
    this.inputRef = React.createRef();
  }

  handleSubmit = () => {
    const { onSelect } = this.props;
    onSelect(this.inputRef.current.value);
  };

  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { show, title, options, okButtonLabel } = this.props;

    return (
      <Modal show={show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control ref={this.inputRef} as="select">
            {options.map(entry => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Form.Control>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={this.handleSubmit}>
            {okButtonLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
