const { ipcRenderer, contextBridge } = window.require('electron');


console.log('preload');
contextBridge.exposeInMainWorld('ipc', {
    on: (channel, handler) => {
        ipcRenderer.on(channel, handler);
    },
    send: ipcRenderer.send,
    invoke: ipcRenderer.invoke,
});
