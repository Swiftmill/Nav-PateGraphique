import { useEffect, useMemo, useState } from 'react';
import { SessionTab } from '@common/types';
import TitleBar from './components/TitleBar';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import NewTabPage from './components/NewTabPage';
import PerformanceWidget from './components/PerformanceWidget';
import NotesPanel from './components/NotesPanel';
import DownloadManager from './components/DownloadManager';
import SessionManager from './components/SessionManager';
import VpnSwitcher from './components/VpnSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import ModsManager from './components/ModsManager';
import PasswordManager from './components/PasswordManager';

const App = () => {
  const [tabs, setTabs] = useState<SessionTab[]>([]);
  const [themeCss, setThemeCss] = useState<string>('');
  const [mods, setMods] = useState<any[]>([]);
  const [performance, setPerformance] = useState<{ mode: string; stats: any; preset: any } | null>(null);

  useEffect(() => {
    window.pateGraphique.tabs.get().then(setTabs);
    const unsubscribeTabs = window.pateGraphique.tabs.onUpdate((updatedTabs: SessionTab[]) => setTabs(updatedTabs));
    const unsubscribeTheme = window.pateGraphique.theme.onUpdate((css: string) => setThemeCss(css));
    const unsubscribeMods = window.pateGraphique.mods.onUpdate((loadedMods: any[]) => setMods(loadedMods));
    const unsubscribePerf = window.pateGraphique.performance.onUpdate((payload: any) => setPerformance(payload));
    return () => {
      unsubscribeTabs?.();
      unsubscribeTheme?.();
      unsubscribeMods?.();
      unsubscribePerf?.();
    };
  }, []);

  useEffect(() => {
    if (!themeCss) return;
    const style = document.createElement('style');
    style.id = 'pg-active-theme';
    style.innerHTML = themeCss;
    const existing = document.getElementById(style.id);
    if (existing) existing.remove();
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [themeCss]);

  const activeTab = useMemo(() => tabs.find((tab) => tab.isActive), [tabs]);

  return (
    <div className="app-shell">
      <TitleBar activeTab={activeTab} onNewTab={() => window.pateGraphique.tabs.create()} />
      <TabBar
        tabs={tabs}
        onActivate={(id) => window.pateGraphique.tabs.activate(id)}
        onClose={(id) => window.pateGraphique.tabs.close(id)}
        onCreate={() => window.pateGraphique.tabs.create()}
        onDetach={(id) => window.pateGraphique.tabs.detach(id)}
        onReorder={(sourceIndex, destinationIndex) =>
          window.pateGraphique.tabs.move(sourceIndex, destinationIndex)
        }
        onSplit={(leftId, rightId) => window.pateGraphique.tabs.split(leftId, rightId)}
        onUnsplit={() => window.pateGraphique.tabs.unsplit()}
      />
      <div className="main-content">
        <Sidebar
          tabs={tabs}
          performance={performance}
          notes={<NotesPanel />}
          downloads={<DownloadManager />}
          session={<SessionManager />}
          vpn={<VpnSwitcher />}
          themes={<ThemeSwitcher />}
          mods={<ModsManager mods={mods} />}
          passwords={<PasswordManager />}
        />
        <div className="content-area">
          {!activeTab && <NewTabPage onCreateTab={() => window.pateGraphique.tabs.create()} />}
          <PerformanceWidget performance={performance} />
        </div>
      </div>
    </div>
  );
};

export default App;
