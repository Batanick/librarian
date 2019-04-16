import React from 'react';

const log = require('electron-log');

export const OverlayContext = React.createContext({
  registerLink: (sourceId, targetId) => {
    log.silly(sourceId);
  },
});
