export interface VPNServer {
  name: string;
  host: string;
  port: number;
  type: 'socks5' | 'http';
  username?: string;
  password?: string;
}

export interface ThemeConfig {
  activeTheme: string;
  allowExternalThemes: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

export interface ConfigSchema {
  general: {
    startPage: string;
    homepage: string;
    defaultSearchEngine: string;
    hardwareAcceleration: boolean;
    maxRendererProcesses: number;
    telemetry: boolean;
  };
  privacy: {
    adBlocker: boolean;
    trackerBlocker: boolean;
    fingerprintingProtection: boolean;
    blockSocialWidgets: boolean;
  };
  vpn: {
    enabled: boolean;
    autoConnect: boolean;
    servers: VPNServer[];
  };
  themes: ThemeConfig;
  mods: {
    enabled: boolean;
    autoReload: boolean;
  };
  security: {
    masterPasswordPrompt: boolean;
    sessionTimeout: number;
  };
  performance: {
    gamingMode: PerformancePreset;
    focusMode: PerformancePreset;
  };
  sidebar: {
    enabled: boolean;
    items: SidebarItem[];
  };
  extensions: {
    allowChromeExtensions: boolean;
    autoload: string[];
  };
}

export interface PerformancePreset {
  limitCPU: number;
  limitRAM: number;
  disableAnimations?: boolean;
  suspendBackgroundTabs?: boolean;
}

export interface SessionTab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isPinned?: boolean;
  groupId?: string;
  webContentsId?: number;
}

export interface BrowserSessionState {
  tabs: SessionTab[];
  lastActiveId?: string;
}
