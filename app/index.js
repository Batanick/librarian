import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Root from './containers/Root';
import './app.global.css';

import './js/zoom'

render(
  <AppContainer>
    <Root/>
  </AppContainer>,
  document.getElementById('root')
);
