// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const log = require('electron-log');

// import './ResourceForm.css';

type Props = {
  name: PropTypes.string,
  schema: PropTypes.obj,
  data: PropTypes.obj,
  onChange: PropTypes.func
};

export default class ResourceForm extends Component<Props> {
  render() {

    const {name} = this.props;

    return (
      <div className="card">
        <div className='card-header'>
          PrizeBox: 12345
        </div>

        <div className='card-body'>
          <form>
            <div className="form-group row mb-1">
              <label htmlFor="inputEmail3" className="w-25 col-form-label col-form-label-sm">Email:</label>
              <div className="w-75">
                <input type="email" className="form-control form-control-sm" id="inputEmail3" placeholder="Email"/>
              </div>
            </div>
            <div className="form-group row mb-1">
              <label htmlFor="inputPassword3" className="w-25 col-form-label col-form-label-sm">Passwdsadasddasdasdord</label>
              <div className="w-75">
                <input type="password" className="form-control form-control-sm" id="inputPassword3" placeholder="Password"/>
              </div>
            </div>
            <div className="form-group row mb-1">
              <label htmlFor="inputEmail3" className="w-25 col-form-label col-form-label-sm">Checkbox test:</label>
              <div className="w-75">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="gridCheck1"/>
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>
    );
  }
}
