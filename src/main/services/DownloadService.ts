import { BrowserWindow, DownloadItem, Session } from 'electron';
import path from 'path';
import EventEmitter from 'eventemitter3';

interface DownloadEvent {
  id: string;
  url: string;
  filename: string;
  receivedBytes: number;
  totalBytes: number;
  state: ReturnType<DownloadItem['getState']>;
}

export class DownloadService extends EventEmitter {
  private downloads = new Map<string, DownloadItem>();

  constructor() {
    super();
  }

  registerSession(session: Session): void {
    session.on('will-download', (_event, item) => {
      const id = item.getURLChain().join('-');
      this.downloads.set(id, item);
      const savePath = path.join(
        process.env.USERPROFILE ?? process.env.HOME ?? process.cwd(),
        'Downloads',
        item.getFilename()
      );
      item.setSavePath(savePath);
      item.on('updated', () => {
        this.emit('update', this.serialize(item, id));
      });
      item.once('done', () => {
        this.emit('done', this.serialize(item, id));
        this.downloads.delete(id);
      });
    });
  }

  enqueue(url: string, window: BrowserWindow): void {
    void window.webContents.downloadURL(url);
  }

  private serialize(item: DownloadItem, id: string): DownloadEvent {
    return {
      id,
      url: item.getURL(),
      filename: item.getFilename(),
      receivedBytes: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes(),
      state: item.getState()
    };
  }
}
