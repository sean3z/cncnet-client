const {app, BrowserWindow, ipcMain, crashReporter} = require('electron');

// Report crashes to our server.
crashReporter.start({
  productName: 'CnCet5 Client',
  companyName: 'Sean Wragg',
  submitURL: 'https://your-domain.com/url-to-submit',
  autoSubmit: true
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 400, height: 490, center: true});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/client/login.html');
  mainWindow.setResizable(false);
  // mainWindow.openDevTools();
  mainWindow.setMenu(null);

  ipcMain.on('asynchronous-message', function(event, arg) {
      switch (arg.event) {
          case 'authenticated':
            mainWindow.hide();

            require(__dirname +'/server/websocket')(arg);
            mainWindow.loadURL('file://' + __dirname + '/client/app.html');
            mainWindow.show();
            mainWindow.setSize(1180, 560);
            mainWindow.setResizable(true);
            mainWindow.setMinimumSize(1180, 560);

            // Open the DevTools.
            mainWindow.openDevTools();
          break;

          case 'privmsg':
              mainWindow.flashFrame(true);
          break;
      }
  });

  // Open external links in default Browser when clicked
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('shell').openExternal(url);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
