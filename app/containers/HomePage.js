// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import Workspace from "../components/Workspace";

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return <Workspace />;
  }
}
