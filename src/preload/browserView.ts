import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('browserViewAPI', {
  requestPiP: () => ipcRenderer.send('browserview:picture-in-picture')
});
