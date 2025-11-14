import { useEffect, useState } from 'react';
import { SessionTab } from '@common/types';

const SessionManager = () => {
  const [session, setSession] = useState<{ tabs: SessionTab[] }>({ tabs: [] });

  useEffect(() => {
    window.pateGraphique.session.restore().then((state: any) => setSession(state));
  }, []);

  const saveSession = () => {
    window.pateGraphique.session.save();
  };

  return (
    <div>
      <h3>Sessions</h3>
      <button onClick={saveSession}>Sauvegarder la session</button>
      <ul style={{ marginTop: '12px', listStyle: 'none', padding: 0 }}>
        {session.tabs?.map((tab: SessionTab) => (
          <li key={tab.id}>{tab.title || tab.url}</li>
        ))}
      </ul>
    </div>
  );
};

export default SessionManager;
