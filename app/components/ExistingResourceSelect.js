// @flow
import React, {Component} from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import update from 'immutability-helper';

import * as Events from '../constants/events';
import * as Consts from '../constants/constants';

const log = require('electron-log');

const {ipcRenderer} = window.require('electron');

type Props = {};

export default class ExistingResourceSelect extends Component<Props> {
  props: Props;

  inputRef: null;

  tableRef: null;

  filterRef: null;

  static isFiltered(filter, id, res) {
    if (filter == null) {
      return false;
    }

    if (id.toLowerCase().indexOf(filter) > -1) {
      return false;
    }

    return !Object.values(res).some(v => v.toLowerCase().indexOf(filter) > -1);
  }

  constructor(...args) {
    super(args);
    this.state = {
      dialogShow: false,
      resources: {},
      filter: null
    };

    this.inputRef = React.createRef();
    this.tableRef = React.createRef();
    this.filterRef = React.createRef();

    this.filterTable = this.filterTable.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addSingle = this.addSingle.bind(this);
    this.addAllSelected = this.addAllSelected.bind(this);
  }

  componentDidMount() {
    const selfThis = this;
    ipcRenderer.on(Events.DIALOG_LOAD_EXISTING_RESOURCE, (event, arg) => {
      selfThis.show(arg);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Events.DIALOG_LOAD_EXISTING_RESOURCE);
  }

  show(index) {
    this.setState(prevState =>
      update(prevState, {
        $set: {
          resources: index,
          dialogShow: true
        }
      })
    );

    this.filterRef.current.focus();
  }

  addAllSelected() {
    const {resources} = this.state;
    const filter = this.filterRef.current.value.toLowerCase();
    const result = [];
    Object.keys(resources).forEach(key => {
      const res = resources[key];
      if (!ExistingResourceSelect.isFiltered(filter, key, res)) {
        result.push(key);
      }
    });

    log.error(result);
    if (result.length > 0) {
      ipcRenderer.send(Events.DIALOG_SELECT_EXISTING_RESOURCE, result);
      this.handleClose();
    }
  }

  addSingle(resId) {
    const {resources} = this.state;
    const res = resources[resId];
    if (!res) {
      log.error(`Unable to find resource with id: ${resId}`);
      return;
    }

    ipcRenderer.send(Events.DIALOG_SELECT_EXISTING_RESOURCE, [resId]);
  }

  filterTable() {
    const filter = this.filterRef.current.value.toLowerCase();
    this.setState(prevState => update(prevState, {$merge: {filter}}));
  }

  handleClose() {
    this.setState({
      dialogShow: false,
      resources: {},
      filter: null
    });
  }

  render() {
    const {resources, dialogShow, filter} = this.state;
    const addSingleHandler = this.addSingle;
    const addAllSelectedHandler = this.addAllSelected;
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
              id="focusInput"
              type="text"
              placeholder="Search.."
              onKeyUp={this.filterTable}
            />
            <br/>
            <table className="table table-bordered table-striped table-sm">
              <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Id</th>
                <th>Path</th>
                <th>Add</th>
              </tr>
              </thead>
              <tbody ref={this.tableRef}>
              {Object.keys(resources).map(key => {
                const res = resources[key];

                if (ExistingResourceSelect.isFiltered(filter, key, res)) {
                  return;
                }

                const wrapper = () => {
                  addSingleHandler(key);
                };

                return (
                  <tr key={key}>
                    <td>{res[Consts.FIELD_NAME_NAME]}</td>
                    <td>{res[Consts.FIELD_NAME_TYPE]}</td>
                    <td>{key}</td>
                    <td>{res[Consts.FIELD_NAME_PATH]}</td>
                    <td>
                      <Button
                        className="btn btn-secondary btn-sm"
                        onClick={wrapper}
                      >
                        →
                      </Button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              className="btn btn-primary"
              onClick={addAllSelectedHandler}
            >
              Add all
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
