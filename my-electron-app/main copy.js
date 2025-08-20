const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    fullscreenable: false,
    focusable: false, // disables window focus
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.setIgnoreMouseEvents(true); // makes it click-through
  win.loadFile('index.html');

  // Optional: remove window from task switcher (Windows)
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true);
  win.setFullScreenable(false);
}

app.whenReady().then(createWindow);

// const { app, BrowserWindow } = require('electron')

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600
//   })

//   win.loadFile('index.html')
// }

// app.whenReady().then(() => {
//   createWindow()
// })
