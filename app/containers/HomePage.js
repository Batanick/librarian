// @flow
import React, { Component } from 'react';
import Workspace from "../components/Workspace";

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return <Workspace pos={{left:0, top: 0}} />;
  }
}
