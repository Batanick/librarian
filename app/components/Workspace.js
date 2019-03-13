// @flow
import React, { Component } from 'react';
import styles from './Workspace.css';

type Props = {};

export default class Workspace extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Workspace</h2>
      </div>
    );
  }
}
