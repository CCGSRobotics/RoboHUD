const {
  app,
  BrowserWindow,
  Menu,
} = require('electron');
let win;

/**
 * Creates a new browser window using the Electron API
 */
function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1200,
    icon: 'Assets/icon.png',
  });
  win.loadFile('App/wizard.html');
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
      {
        role: 'toggledevtools',
      },
      {
        type: 'separator',
      },
      {
        role: 'resetzoom',
      },
      {
        role: 'zoomin',
      },
      {
        role: 'zoomout',
      },
      {
        type: 'separator',
      },
      {
        role: 'togglefullscreen',
      },
    ],
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
      },
      {
        role: 'close',
      },
    ],
  },
  {
    label: 'Tools',
    submenu: [
      {
        label: 'Main Driving View',
        click() {
          win.loadFile('App/index.html');
        },
      },
      {
        label: 'Remote Dynamixel Wizard',
        click() {
          win.loadFile('App/wizard.html');
        },
      },
      {
        label: 'Create New Robot',
        click() {
          win.loadFile('App/robot.html');
        },
      },
      {
        label: 'Create New Servo',
        click() {
          win.loadFile('App/createServo.html');
        },
      },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

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
