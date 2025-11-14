import keytar from 'keytar';
import Store from 'electron-store';
import crypto from 'crypto';

interface PasswordEntry {
  id: string;
  url: string;
  username: string;
  password: string;
  createdAt: number;
}

interface VaultState {
  masterPasswordHash?: string;
}

export class PasswordVault {
  private store: Store<VaultState>;

  constructor() {
    this.store = new Store<VaultState>({ name: 'password-vault' });
  }

  async setMasterPassword(password: string): Promise<void> {
    const hash = this.hashPassword(password);
    this.store.set('masterPasswordHash', hash);
  }

  async validateMasterPassword(password: string): Promise<boolean> {
    const hash = this.store.get('masterPasswordHash');
    if (!hash) return true;
    return hash === this.hashPassword(password);
  }

  async save(entry: PasswordEntry): Promise<void> {
    await keytar.setPassword('Pâte Graphique', `${entry.url}:${entry.username}`, entry.password);
  }

  async get(payload: { url: string; username: string }): Promise<string | null> {
    return keytar.getPassword('Pâte Graphique', `${payload.url}:${payload.username}`);
  }

  async list(): Promise<PasswordEntry[]> {
    const credentials = await keytar.findCredentials('Pâte Graphique');
    return credentials.map((cred) => {
      const [url, username] = cred.account.split(':');
      return {
        id: cred.account,
        url,
        username,
        password: cred.password,
        createdAt: Date.now()
      };
    });
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
