import fs from 'fs';
import path from 'path';
import { BrowserView } from 'electron';

export class UserScriptService {
  private scripts: string[] = [];
  private styles: string[] = [];

  constructor() {
    this.reload();
  }

  reload(): void {
    const dir = path.resolve(__dirname, '../../../user-scripts');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.scripts = [];
    this.styles = [];
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (file.endsWith('.js')) {
        this.scripts.push(fs.readFileSync(fullPath, 'utf-8'));
      }
      if (file.endsWith('.css')) {
        this.styles.push(fs.readFileSync(fullPath, 'utf-8'));
      }
    }
  }

  apply(view: BrowserView): void {
    for (const style of this.styles) {
      view.webContents.insertCSS(style).catch(() => undefined);
    }
    for (const script of this.scripts) {
      view.webContents.executeJavaScript(script).catch(() => undefined);
    }
  }
}
