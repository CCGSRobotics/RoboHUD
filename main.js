const {
  app,
  BrowserWindow
} = require('electron');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1200
  });
  win.loadFile('App/loading.html');
  setTimeout(function() {
    win.loadFile('App/index.html');
  }, 3000)
  // win.loadURL('http://localhost:8080')
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
