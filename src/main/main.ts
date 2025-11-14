import path from 'path';
import electron from 'electron';
import type { Session } from 'electron';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { loadConfig } from '../common/config';
import { BrowserSessionState, ConfigSchema, SessionTab } from '../common/types';
import { AdBlockService } from './services/AdBlockService';
import { VPNService } from './services/VPNService';
import { PasswordVault } from './services/PasswordVault';
import { DownloadService } from './services/DownloadService';
import { ThemeService } from './services/ThemeService';
import { ModsService } from './services/ModsService';
import { SessionService } from './services/SessionService';
import { createNewTab } from './modules/createNewTab';
import { performanceLimiter } from './services/PerformanceLimiter';
import { UserScriptService } from './services/UserScriptService';

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  session,
  nativeTheme,
  BrowserView,
  shell
} = electron;

let mainWindow: BrowserWindow | null = null;
let mainSession: Session;
let config: ConfigSchema;
let currentTabs: SessionTab[] = [];
const tabViews = new Map<string, BrowserView>();
let splitMode: { left: string; right: string } | null = null;

const store = new Store<BrowserSessionState>({
  name: 'session-state',
  defaults: {
    tabs: [],
    lastActiveId: undefined
  }
});

const adBlockService = new AdBlockService();
const vpnService = new VPNService();
const passwordVault = new PasswordVault();
const downloadService = new DownloadService();
const themeService = new ThemeService();
const modsService = new ModsService();
const sessionService = new SessionService(store);
const userScriptService = new UserScriptService();

function setupConfig(): void {
  config = loadConfig();

  if (!config.general.hardwareAcceleration) {
    app.disableHardwareAcceleration();
  }

  if (config.general.maxRendererProcesses > 0) {
    app.commandLine.appendSwitch(
      'renderer-process-limit',
      config.general.maxRendererProcesses.toString()
    );
  }

  app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling,WebContentsForceDark');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
}

function createMainWindow(): BrowserWindow {
  const preloadPath = path.resolve(__dirname, '../preload/index.js');
  const window = new BrowserWindow({
    width: 1500,
    height: 960,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#050510',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: preloadPath,
      contextIsolation: true,
      spellcheck: true,
      sandbox: false,
      webviewTag: true
    }
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  window.on('close', () => {
    sessionService.persist(currentTabs);
  });

  window.on('resize', () => {
    renderViews();
  });

  return window;
}

async function createWindow(): Promise<void> {
  setupConfig();
  mainWindow = createMainWindow();
  mainSession = session.fromPartition('persist:pate-graphique');

  await adBlockService.enable(mainSession, config);
  await vpnService.configure(config.vpn);
  await themeService.apply(config.themes.activeTheme);
  await modsService.loadAll(config.mods);
  broadcastTheme();

  const savedSession = sessionService.restore();
  if (savedSession.tabs.length === 0) {
    const initialTab = createNewTab({
      url: config.general.homepage,
      active: true
    });
    currentTabs = [initialTab];
  } else {
    currentTabs = savedSession.tabs;
    if (!currentTabs.some((tab) => tab.isActive) && currentTabs.length > 0) {
      currentTabs[0].isActive = true;
    }
  }

  mainWindow!.loadURL(getRendererUrl());
  registerIpcHandlers();
  performanceLimiter.setup(mainWindow!, config.performance);
  autoUpdater.checkForUpdatesAndNotify();

  const activeTab = currentTabs.find((tab) => tab.isActive) ?? currentTabs[0];
  if (activeTab) {
    attachView(activeTab);
  }
  broadcastTabs();
}

function getRendererUrl(): string {
  if (app.isPackaged) {
    return path.join('file://', __dirname, '../renderer/index.html');
  }
  return process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
}

function registerIpcHandlers(): void {
  ipcMain.handle('tabs:get', () => currentTabs);

  ipcMain.handle('tabs:create', (_, payload: { url?: string }) => {
    const tab = createNewTab({ url: payload.url ?? config.general.homepage, active: true });
    currentTabs.forEach((t) => (t.isActive = false));
    currentTabs.push(tab);
    attachView(tab);
    broadcastTabs();
    return tab;
  });

  ipcMain.handle('tabs:activate', (_, tabId: string) => {
    const target = currentTabs.find((tab) => tab.id === tabId);
    if (!target || !mainWindow) return;
    currentTabs.forEach((tab) => (tab.isActive = tab.id === tabId));
    attachView(target);
    broadcastTabs();
  });

  ipcMain.handle('tabs:close', (_, tabId: string) => {
    const index = currentTabs.findIndex((tab) => tab.id === tabId);
    if (index === -1) return;
    const [removed] = currentTabs.splice(index, 1);
    if (removed) {
      const existingView = tabViews.get(removed.id);
      if (existingView && mainWindow) {
        mainWindow.removeBrowserView(existingView);
        const wc = existingView.webContents;
        if (!wc.isDestroyed()) {
          (wc as any).destroy?.();
        }
      }
      tabViews.delete(removed.id);
    }
    if (!currentTabs.some((tab) => tab.isActive) && currentTabs.length > 0) {
      currentTabs[currentTabs.length - 1].isActive = true;
      attachView(currentTabs[currentTabs.length - 1]);
    }
    broadcastTabs();
    renderViews();
  });

  ipcMain.handle('tabs:move', (_, { sourceIndex, destinationIndex }) => {
    const [moved] = currentTabs.splice(sourceIndex, 1);
    currentTabs.splice(destinationIndex, 0, moved);
    broadcastTabs();
  });

  ipcMain.handle('tabs:update-url', (_, { tabId, url }) => {
    const tab = currentTabs.find((t) => t.id === tabId);
    if (!tab) return;
    tab.url = url;
    const view = tabViews.get(tabId);
    view?.webContents.loadURL(url);
    broadcastTabs();
  });

  ipcMain.handle('tabs:detach', (_, tabId: string) => {
    const tab = currentTabs.find((t) => t.id === tabId);
    if (!tab) return;
    const view = tabViews.get(tabId);
    if (!view) return;
    const popup = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    popup.on('close', () => {
      const wc = view.webContents;
      if (!wc.isDestroyed()) {
        (wc as any).destroy?.();
      }
    });
    popup.setBrowserView(view);
    const [width, height] = popup.getContentSize();
    view.setBounds({ x: 0, y: 0, width, height });
    view.setAutoResize({ width: true, height: true });
    currentTabs = currentTabs.filter((t) => t.id !== tabId);
    tabViews.delete(tabId);
    broadcastTabs();
    renderViews();
  });

  ipcMain.handle('tabs:split', (_, { leftId, rightId }) => {
    const leftTab = currentTabs.find((tab) => tab.id === leftId);
    const rightTab = currentTabs.find((tab) => tab.id === rightId);
    if (!leftTab || !rightTab) return;
    splitMode = { left: leftId, right: rightId };
    currentTabs.forEach((tab) => {
      tab.isActive = tab.id === leftId;
    });
    ensureView(leftTab);
    ensureView(rightTab);
    renderViews();
    broadcastTabs();
  });

  ipcMain.handle('tabs:unsplit', () => {
    splitMode = null;
    renderViews();
    broadcastTabs();
  });

  ipcMain.handle('theme:apply', async (_, themeName: string) => {
    await themeService.apply(themeName);
    broadcastTheme();
  });

  ipcMain.handle('mods:reload', async () => {
    await modsService.loadAll(config.mods);
    broadcastMods();
  });

  ipcMain.handle('userScripts:reload', () => {
    userScriptService.reload();
  });

  ipcMain.handle('vpn:set-server', async (_, serverName: string) => {
    await vpnService.connect(serverName);
  });

  ipcMain.handle('vpn:disable', async () => {
    await vpnService.disconnect();
  });

  ipcMain.handle('download:start', (_, url: string) => {
    downloadService.enqueue(url, mainWindow!);
  });

  ipcMain.handle('password:save', (_, payload) => passwordVault.save(payload));
  ipcMain.handle('password:get', (_, payload) => passwordVault.get(payload));
  ipcMain.handle('password:list', () => passwordVault.list());

  ipcMain.handle('session:save', () => sessionService.persist(currentTabs));
  ipcMain.handle('session:restore', () => sessionService.restore());

  ipcMain.handle('performance:mode', (_, mode: 'gaming' | 'focus' | 'normal') => {
    performanceLimiter.switchMode(mode);
  });

  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());

  ipcMain.handle('nativeTheme:toggle', () => {
    nativeTheme.themeSource = nativeTheme.themeSource === 'dark' ? 'light' : 'dark';
    return nativeTheme.themeSource;
  });

  ipcMain.handle('extensions:install', async (_, crxPath: string) => {
    if (!config.extensions.allowChromeExtensions) return false;
    try {
      await mainSession.loadExtension(crxPath);
      return true;
    } catch (error) {
      dialog.showErrorBox('Erreur extension', String(error));
      return false;
    }
  });

  ipcMain.handle('mods:open-folder', () => {
    shell.openPath(path.resolve(app.getPath('userData'), 'mods'));
  });
}

function broadcastTabs(): void {
  if (!mainWindow) return;
  mainWindow.webContents.send('tabs:update', currentTabs);
  sessionService.persist(currentTabs);
}

function broadcastTheme(): void {
  mainWindow?.webContents.send('theme:update', themeService.getCurrentTheme());
}

function broadcastMods(): void {
  mainWindow?.webContents.send('mods:update', modsService.getActiveMods());
}

function ensureView(tab: SessionTab): BrowserView {
  let view = tabViews.get(tab.id);
  if (!view) {
    view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, '../preload/browserView.js'),
        partition: 'persist:pate-graphique'
      }
    });
    view.webContents.loadURL(tab.url);
    tab.webContentsId = view.webContents.id;
    tabViews.set(tab.id, view);

    downloadService.registerSession(view.webContents.session);
    adBlockService.attachToSession(view.webContents.session);
    userScriptService.apply(view);
  }
  return view;
}

function attachView(tab: SessionTab): void {
  if (!mainWindow) return;
  ensureView(tab);
  splitMode = null;
  renderViews();
}

function renderViews(): void {
  if (!mainWindow) return;
  for (const view of mainWindow.getBrowserViews()) {
    mainWindow.removeBrowserView(view);
  }

  if (splitMode) {
    const leftTab = currentTabs.find((tab) => tab.id === splitMode!.left);
    const rightTab = currentTabs.find((tab) => tab.id === splitMode!.right);
    if (!leftTab || !rightTab) {
      splitMode = null;
      renderViews();
      return;
    }
    const leftView = ensureView(leftTab);
    const rightView = ensureView(rightTab);
    mainWindow.addBrowserView(leftView);
    mainWindow.addBrowserView(rightView);
    const bounds = mainWindow.getContentBounds();
    const topOffset = 120;
    const usableHeight = bounds.height - topOffset;
    const halfWidth = Math.floor(bounds.width / 2);
    leftView.setBounds({ x: 0, y: topOffset, width: halfWidth, height: usableHeight });
    rightView.setBounds({
      x: halfWidth,
      y: topOffset,
      width: bounds.width - halfWidth,
      height: usableHeight
    });
    leftView.setAutoResize({ width: false, height: true });
    rightView.setAutoResize({ width: false, height: true });
    return;
  }

  const activeTab = currentTabs.find((tab) => tab.isActive) ?? currentTabs[0];
  if (!activeTab) return;
  const view = ensureView(activeTab);
  mainWindow.addBrowserView(view);
  const bounds = mainWindow.getContentBounds();
  const topOffset = 120;
  view.setBounds({ x: 0, y: topOffset, width: bounds.width, height: bounds.height - topOffset });
  view.setAutoResize({ width: true, height: true });
}

app.on('ready', async () => {
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
