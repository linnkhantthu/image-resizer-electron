const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const ResizeImg = require("resize-img");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Open devtools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 300,
    height: 300,
  });
  // Open devtools
  if (isDev) {
    aboutWindow.webContents.openDevTools();
  }
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// Menu Template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "Ctrl+Q",
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

app.whenReady().then(() => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  // Remove mainWindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Respond to ipcRenderer
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await ResizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Create filename
    const filename = path.basename(imgPath);

    // Create dest folder if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.writeFileSync(path.join(dest, filename), newPath);
    // send success message to renderer
    mainWindow.webContents.send("image:done");

    // open dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error.message);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
