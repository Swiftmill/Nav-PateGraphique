import { session } from 'electron';
import { ConfigSchema, VPNServer } from '../../common/types';

export class VPNService {
  private servers: VPNServer[] = [];
  private activeServer: VPNServer | null = null;

  async configure(config: ConfigSchema['vpn']): Promise<void> {
    this.servers = config.servers;
    if (config.enabled && config.autoConnect && this.servers.length > 0) {
      await this.connect(this.servers[0].name);
    }
  }

  async connect(name: string): Promise<void> {
    const server = this.servers.find((s) => s.name === name);
    if (!server) throw new Error(`Serveur VPN introuvable: ${name}`);
    const proxyRules = `${server.type}=${server.host}:${server.port}`;
    await Promise.all([
      session.defaultSession.setProxy({ proxyRules }),
      session.fromPartition('persist:pate-graphique').setProxy({ proxyRules })
    ]);
    this.activeServer = server;
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      session.defaultSession.setProxy({ mode: 'direct' }),
      session.fromPartition('persist:pate-graphique').setProxy({ mode: 'direct' })
    ]);
    this.activeServer = null;
  }

  getActiveServer(): VPNServer | null {
    return this.activeServer;
  }
}
