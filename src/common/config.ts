import fs from 'fs';
import path from 'path';
import { ConfigSchema } from './types';

const CONFIG_PATH = path.resolve(__dirname, '../../config/config.json');

let cachedConfig: ConfigSchema | null = null;

export function loadConfig(): ConfigSchema {
  if (cachedConfig) {
    return cachedConfig;
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  cachedConfig = JSON.parse(raw) as ConfigSchema;
  return cachedConfig;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function updateConfig(partial: Partial<ConfigSchema>): ConfigSchema {
  const current = loadConfig();
  const updated = { ...current, ...partial } as ConfigSchema;
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  cachedConfig = updated;
  return updated;
}
