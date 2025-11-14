import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { ConfigSchema } from '../../common/types';

export interface ModDescriptor {
  name: string;
  path: string;
  indexHtml: string;
}

export class ModsService {
  private activeMods: ModDescriptor[] = [];

  async loadAll(config: ConfigSchema['mods']): Promise<void> {
    if (!config.enabled) {
      this.activeMods = [];
      return;
    }

    const modsDir = path.resolve(app.getPath('userData'), 'mods');
    if (!fs.existsSync(modsDir)) {
      fs.mkdirSync(modsDir, { recursive: true });
    }

    const bundledModsDir = path.resolve(__dirname, '../../../mods');
    const sources = [bundledModsDir, modsDir].filter((dir) => fs.existsSync(dir));
    const mods: ModDescriptor[] = [];

    for (const source of sources) {
      for (const entry of fs.readdirSync(source)) {
        const modPath = path.resolve(source, entry);
        const index = path.join(modPath, 'index.html');
        if (fs.existsSync(index)) {
          mods.push({ name: entry, path: modPath, indexHtml: index });
        }
      }
    }

    this.activeMods = mods;
  }

  getActiveMods(): ModDescriptor[] {
    return this.activeMods;
  }
}
