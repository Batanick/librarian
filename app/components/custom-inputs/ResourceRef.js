// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as Consts from '../../constants/constants';
import SvgConnector from "./SvgConnector";

const log = require('electron-log');


type Props = {
  id: PropTypes.string,
  resourceId: PropTypes.string,
  value: PropTypes.string,
  onChangeField: PropTypes.func,
  renderingContext: PropTypes.obj
};

const overlayStyles = {
  position: 'absolute',
  width: Consts.WORKSPACE_SIZE,
  height: Consts.WORKSPACE_SIZE,
  pointerEvents: 'none',
  left: 0,
  top: 0,
  zIndex: 2
};

const svgStyles = {
  pointerEvents: 'auto',
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

  render() {
    const {value, id} = this.props;

    return (<div>
        <SvgConnector/>
        <input ref={this.target}
               id={id}
               type="checkbox"
               className="form-control form-control-sm"
               checked={value === 'true'}
               onChange={this.update}
        />

      </div>
    );
  }
}
