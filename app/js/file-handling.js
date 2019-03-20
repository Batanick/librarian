import * as Event from "../constants/events";

const {ipcRenderer} = window.require('electron');

ipcRenderer.on(Event.FILE_LOAD_FOLDER, (event) => {
  console.log(event);
});

ipcRenderer.on(Event.FILE_ADD_RESOURCE, (event, arg) => {
  console.log(event);
  console.log(arg);
});

ipcRenderer.on(Event.FILE_NEW_RESOURCE, (event, arg) => {
  console.log(event);
  console.log(arg);
});


