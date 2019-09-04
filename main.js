const { app, systemPreferences, BrowserWindow } = require('electron');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 350,
    minWidth: 350,
    height: 350,
    minHeight: 350,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.openDevTools({ mode: 'undocked' });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (systemPreferences && systemPreferences.askForMediaAccess) {
    systemPreferences.askForMediaAccess('microphone').then(() => {
      console.log('Successfully gathered media access permissions.');
    }).catch(() => {
      window.alert('Media access permissions are requested.');
    });
  }
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
