const { app, BrowserWindow } = require('electron');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 330,
    minWidth: 330,
    height: 330,
    minHeight: 330,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.openDevTools({ mode: 'undocked' });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
