// @flow
import React, { Component } from 'react';
import Workspace from '../components/Workspace';

type Props = {};

const styles = {
  overflowY: 'scroll',
  overflowX: 'scroll'
};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div style={Object.assign({}, styles)}>
        <Workspace connectDropTarget={{}} />
      </div>
    );
  }
}
