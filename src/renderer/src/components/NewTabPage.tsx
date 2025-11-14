interface Props {
  onCreateTab: () => void;
}

const NewTabPage = ({ onCreateTab }: Props) => {
  return (
    <div className="new-tab-page" style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Bienvenue dans Pâte Graphique</h1>
      <p style={{ maxWidth: '560px', color: 'var(--pg-muted)' }}>
        Un navigateur conçu pour les créatifs, les gamers et les passionnés de personnalisation.
        Importez vos thèmes, scripts et mods pour transformer totalement l’expérience.
      </p>
      <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
        <button onClick={onCreateTab}>Commencer à naviguer</button>
        <button onClick={() => window.pateGraphique.performance.setMode('gaming')}>Activer mode Gaming</button>
        <button onClick={() => window.pateGraphique.performance.setMode('focus')}>Mode Focus</button>
      </div>
      <section style={{ marginTop: '48px' }}>
        <h2>Widgets système</h2>
        <div className="widget-grid">
          <div className="widget">
            <h3>Stats CPU/RAM</h3>
            <p id="widget-stats">Suivez l’utilisation en temps réel.</p>
          </div>
          <div className="widget">
            <h3>Flux RSS</h3>
            <p>Ajoutez vos flux favoris via config/config.json.</p>
          </div>
          <div className="widget">
            <h3>Fond animé</h3>
            <p>Déposez vos vidéos dans public/backgrounds.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewTabPage;
