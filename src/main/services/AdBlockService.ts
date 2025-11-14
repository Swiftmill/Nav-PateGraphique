import { Session } from 'electron';
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'cross-fetch';
import { ConfigSchema } from '../../common/types';

export class AdBlockService {
  private blocker: ElectronBlocker | null = null;

  async enable(session: Session, config: ConfigSchema): Promise<void> {
    if (!config.privacy.adBlocker && !config.privacy.trackerBlocker) {
      return;
    }
    if (!this.blocker) {
      this.blocker = await ElectronBlocker.fromLists(fetch, [
        'https://easylist.to/easylist/easylist.txt',
        'https://easylist.to/easylist/easyprivacy.txt',
        'https://secure.fanboy.co.nz/fanboy-annoyance.txt'
      ]);
    }
    this.blocker.enableBlockingInSession(session);
  }

  attachToSession(session: Session): void {
    if (!this.blocker) return;
    this.blocker.enableBlockingInSession(session);
  }
}
