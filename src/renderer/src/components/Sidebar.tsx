import { ReactNode, useState } from 'react';
import { SessionTab } from '@common/types';

interface Props {
  tabs: SessionTab[];
  performance: any;
  notes: ReactNode;
  downloads: ReactNode;
  session: ReactNode;
  vpn: ReactNode;
  themes: ReactNode;
  mods: ReactNode;
  passwords: ReactNode;
}

const Sidebar = ({ tabs, performance, notes, downloads, session, vpn, themes, mods, passwords }: Props) => {
  const [activePanel, setActivePanel] = useState<string>('notes');

  const panels = [
    { id: 'notes', label: 'Notes', content: notes },
    { id: 'downloads', label: 'Téléchargements', content: downloads },
    { id: 'session', label: 'Sessions', content: session },
    { id: 'vpn', label: 'VPN', content: vpn },
    { id: 'themes', label: 'Thèmes', content: themes },
    { id: 'mods', label: 'Mods', content: mods },
    { id: 'passwords', label: 'Mots de passe', content: passwords }
  ];
  const active = panels.find((panel) => panel.id === activePanel) ?? panels[0];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h3>Outils rapides</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {panels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                style={{ opacity: activePanel === panel.id ? 1 : 0.6 }}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pg-glass" style={{ padding: '16px', borderRadius: '16px', minHeight: '200px' }}>
          {active.content}
        </div>
        <div className="pg-glass" style={{ padding: '16px', borderRadius: '16px' }}>
          <h4>Onglets ouverts</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            {tabs.map((tab) => (
              <li key={tab.id} style={{ cursor: 'pointer' }} onClick={() => window.pateGraphique.tabs.activate(tab.id)}>
                {tab.title || tab.url}
              </li>
            ))}
          </ul>
        </div>
        <div className="pg-glass" style={{ padding: '16px', borderRadius: '16px' }}>
          <h4>Performance</h4>
          <p style={{ margin: 0 }}>Mode: {performance?.mode ?? 'normal'}</p>
          <p style={{ margin: '4px 0 0' }}>CPU: {performance?.stats?.cpuUsage ?? 0}%</p>
          <p style={{ margin: '4px 0 0' }}>RAM: {performance?.stats?.memoryUsage ?? 0}%</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
