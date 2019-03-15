// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import type { Store } from '../reducers/types';
import Routes from '../Routes';
import {DragDropContext} from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

type Props = {
  store: Store,
  history: {}
};

class Root extends Component<Props> {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root)
