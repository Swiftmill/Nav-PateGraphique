import path from 'path';
import fs from 'fs';

export class ThemeService {
  private activeTheme: string | null = null;

  async apply(themeName: string): Promise<void> {
    const themePath = path.resolve(__dirname, '../../../themes', themeName, 'theme.css');
    if (!fs.existsSync(themePath)) {
      throw new Error(`Theme introuvable: ${themeName}`);
    }
    this.activeTheme = fs.readFileSync(themePath, 'utf-8');
  }

  getCurrentTheme(): string | null {
    return this.activeTheme;
  }
}
