import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pateGraphique', {
  tabs: {
    get: () => ipcRenderer.invoke('tabs:get'),
    create: (url?: string) => ipcRenderer.invoke('tabs:create', { url }),
    activate: (tabId: string) => ipcRenderer.invoke('tabs:activate', tabId),
    close: (tabId: string) => ipcRenderer.invoke('tabs:close', tabId),
    move: (sourceIndex: number, destinationIndex: number) =>
      ipcRenderer.invoke('tabs:move', { sourceIndex, destinationIndex }),
    updateUrl: (tabId: string, url: string) => ipcRenderer.invoke('tabs:update-url', { tabId, url }),
    detach: (tabId: string) => ipcRenderer.invoke('tabs:detach', tabId),
    split: (leftId: string, rightId: string) => ipcRenderer.invoke('tabs:split', { leftId, rightId }),
    unsplit: () => ipcRenderer.invoke('tabs:unsplit'),
    onUpdate: (callback: (tabs: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, tabs: unknown) => callback(tabs);
      ipcRenderer.on('tabs:update', handler);
      return () => ipcRenderer.removeListener('tabs:update', handler);
    }
  },
  theme: {
    apply: (themeName: string) => ipcRenderer.invoke('theme:apply', themeName),
    onUpdate: (callback: (theme: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, theme: string) => callback(theme);
      ipcRenderer.on('theme:update', handler);
      return () => ipcRenderer.removeListener('theme:update', handler);
    }
  },
  mods: {
    reload: () => ipcRenderer.invoke('mods:reload'),
    openFolder: () => ipcRenderer.invoke('mods:open-folder'),
    onUpdate: (callback: (mods: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, mods: unknown) => callback(mods);
      ipcRenderer.on('mods:update', handler);
      return () => ipcRenderer.removeListener('mods:update', handler);
    }
  },
  userScripts: {
    reload: () => ipcRenderer.invoke('userScripts:reload')
  },
  vpn: {
    setServer: (name: string) => ipcRenderer.invoke('vpn:set-server', name),
    disable: () => ipcRenderer.invoke('vpn:disable')
  },
  downloads: {
    start: (url: string) => ipcRenderer.invoke('download:start', url)
  },
  password: {
    save: (payload: unknown) => ipcRenderer.invoke('password:save', payload),
    get: (payload: unknown) => ipcRenderer.invoke('password:get', payload),
    list: () => ipcRenderer.invoke('password:list')
  },
  session: {
    save: () => ipcRenderer.invoke('session:save'),
    restore: () => ipcRenderer.invoke('session:restore')
  },
  performance: {
    setMode: (mode: 'gaming' | 'focus' | 'normal') => ipcRenderer.invoke('performance:mode', mode),
    onUpdate: (callback: (payload: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => callback(payload);
      ipcRenderer.on('performance:update', handler);
      return () => ipcRenderer.removeListener('performance:update', handler);
    }
  },
  windowControls: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  nativeTheme: {
    toggle: () => ipcRenderer.invoke('nativeTheme:toggle')
  },
  extensions: {
    install: (crxPath: string) => ipcRenderer.invoke('extensions:install', crxPath)
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  onTabsUpdate: (callback: (tabs: unknown) => void) => ipcRenderer.on('tabs:update', (_event, tabs) => callback(tabs))
});
