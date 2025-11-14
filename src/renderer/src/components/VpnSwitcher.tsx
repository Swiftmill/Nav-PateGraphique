import { useState } from 'react';

const VpnSwitcher = () => {
  const [server, setServer] = useState('Paris - FR');

  const connect = () => {
    window.pateGraphique.vpn.setServer(server);
  };

  const disconnect = () => {
    window.pateGraphique.vpn.disable();
  };

  return (
    <div>
      <h3>VPN intégré</h3>
      <select value={server} onChange={(event) => setServer(event.target.value)} style={{ width: '100%', marginBottom: '8px' }}>
        <option>Paris - FR</option>
        <option>Montréal - CA</option>
      </select>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={connect}>Connecter</button>
        <button onClick={disconnect}>Déconnecter</button>
      </div>
    </div>
  );
};

export default VpnSwitcher;
