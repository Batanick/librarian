// @flow
import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import update from 'immutability-helper';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

// const log = require('electron-log');

const { ipcRenderer } = window.require('electron');

type Props = {};

export default class ExistingResourceSelect extends Component<Props> {
  props: Props;

  inputRef: null;

  tableRef: null;

  filterRef: null;

  constructor(...args) {
    super(args);
    this.state = {
      dialogShow: true,
      resources: {
        'dasdasjdas=das=dasd-as-da': {
          $path: 'c:/sdadsad',
          $name: 'SimpleResource',
          $type: 'Simple'
        }
      },
      filter: null
    };

    this.inputRef = React.createRef();
    this.tableRef = React.createRef();
    this.filterRef = React.createRef();

    this.filterTable = this.filterTable.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.DIALOG_LOAD_EXISTING_RESOURCE, (event, arg) => {
      selfThis.showResourceSelect(arg);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.DIALOG_LOAD_EXISTING_RESOURCE);
  }

  filterTable() {
    const filter = this.filterRef.current.value.toLowerCase();
    this.setState(prevState => update(prevState, { $merge: { filter } }));
  }

  handleClose() {
    this.setState({
      dialogShow: false,
      resources: {},
      filter: null
    });
  }

  render() {
    const { resources, dialogShow, filter } = this.state;

    return (
      <div>
        <Modal show={dialogShow} onHide={this.handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Select existing resource</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              ref={this.filterRef}
              className="form-control"
              id="myInput"
              type="text"
              placeholder="Search.."
              onKeyUp={this.filterTable}
            />
            <br />
            <table className="table table-bordered table-striped table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Id</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody ref={this.tableRef}>
                {Object.keys(resources).map(key => {
                  const res = resources[key];

                  let passFilter = filter == null;
                  passFilter =
                    passFilter || key.toLowerCase().indexOf(filter) > -1; // key
                  passFilter =
                    passFilter ||
                    Object.values(res).some(
                      v => v.toLowerCase().indexOf(filter) > -1
                    ); // properties
                  if (!passFilter) {
                    return;
                  }

                  return (
                    <tr key={key}>
                      <td>{res[Consts.FIELD_NAME_NAME]}</td>
                      <td>{res[Consts.FIELD_NAME_TYPE]}</td>
                      <td>{key}</td>
                      <td>{res[Consts.FIELD_NAME_PATH]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmit}>
              Select
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
