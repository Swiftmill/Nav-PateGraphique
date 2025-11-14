import { BrowserWindow } from 'electron';
import os from 'os';
import { PerformancePreset } from '../../common/types';

interface PerformanceConfig {
  gamingMode: PerformancePreset;
  focusMode: PerformancePreset;
}

class PerformanceLimiter {
  private window: BrowserWindow | null = null;
  private config: PerformanceConfig | null = null;
  private currentMode: 'gaming' | 'focus' | 'normal' = 'normal';
  private interval: NodeJS.Timeout | null = null;

  setup(window: BrowserWindow, config: PerformanceConfig): void {
    this.window = window;
    this.config = config;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      if (!this.window) return;
      this.window.webContents.send('performance:update', {
        mode: this.currentMode,
        stats: this.collectStats(),
        preset: this.getPreset()
      });
    }, 2000);
  }

  switchMode(mode: 'gaming' | 'focus' | 'normal'): void {
    this.currentMode = mode;
    const preset = this.getPreset();
    if (!preset || !this.window) return;

    this.window.webContents.send('performance:update', {
      mode,
      stats: this.collectStats(),
      preset
    });
  }

  private collectStats(): { cpuUsage: number; memoryUsage: number } {
    const cpus = os.cpus();
    const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const total = cpus.reduce(
      (acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle,
      0
    );
    const cpuUsage = total === 0 ? 0 : Math.round(100 - (idle / total) * 100);
    const memoryUsage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
    return { cpuUsage, memoryUsage };
  }

  private getPreset(): PerformancePreset | null {
    if (!this.config) return null;
    if (this.currentMode === 'gaming') return this.config.gamingMode;
    if (this.currentMode === 'focus') return this.config.focusMode;
    return null;
  }
}

export const performanceLimiter = new PerformanceLimiter();
