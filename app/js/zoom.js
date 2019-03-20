import * as Event from "../constants/events";

const {webFrame} = require('electron');
// JS magic to disable mouse wheel
document.onmousewheel = function handleMouseWheel(e) {
  const newZoom = Math.min(
    2.0,
    Math.max(0.5, webFrame.getZoomFactor() - 0.005 * e.deltaY)
  );
  webFrame.setZoomFactor(newZoom);
  e.returnValue = false;
};

const {ipcRenderer} = window.require('electron');
ipcRenderer.on(Event.ZOOM_CHANGE, (event, arg) => {
  const newZoom = Math.min(2.0, Math.max(0.5, webFrame.getZoomFactor() + arg));
  webFrame.setZoomFactor(newZoom);
});
