const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// This method will be called when Electron has finished initialization
function createWindow () {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open the DevTools (optional)
  // mainWindow.webContents.openDevTools();
}

// Called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Recreate a window if none exists
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Example IPC listener (optional)
ipcMain.on('example-message', (event, arg) => {
  console.log('Received message:', arg);
  event.reply('example-reply', 'Hello from main process');
});
