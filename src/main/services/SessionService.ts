import Store from 'electron-store';
import { BrowserSessionState, SessionTab } from '../../common/types';

export class SessionService {
  constructor(private store: Store<BrowserSessionState>) {}

  persist(tabs: SessionTab[]): void {
    const sanitized = tabs.map((tab) => ({ ...tab, webContentsId: undefined }));
    this.store.set('tabs', sanitized);
    const active = tabs.find((tab) => tab.isActive);
    this.store.set('lastActiveId', active?.id);
  }

  restore(): BrowserSessionState {
    const tabs = this.store.get('tabs', []).map((tab) => ({ ...tab, webContentsId: undefined }));
    return {
      tabs,
      lastActiveId: this.store.get('lastActiveId')
    };
  }
}
