import { SessionTab } from '@common/types';

interface Props {
  activeTab?: SessionTab;
  onNewTab: () => void;
}

const TitleBar = ({ activeTab, onNewTab }: Props) => {
  return (
    <header className="tab-bar pg-glass" style={{ justifyContent: 'space-between' }}>
      <div className="title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--pg-primary), var(--pg-secondary))',
            boxShadow: '0 8px 18px rgba(0, 224, 255, 0.35)',
            color: '#050510',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.04em'
          }}
        >
          PG
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Pâte Graphique</div>
          <small style={{ color: 'var(--pg-muted)' }}>{activeTab?.title ?? 'Navigateur nouvelle génération'}</small>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onNewTab}>Nouvel onglet</button>
        <button onClick={() => window.pateGraphique.windowControls.minimize()}>—</button>
        <button onClick={() => window.pateGraphique.windowControls.maximize()}>⬜</button>
        <button onClick={() => window.pateGraphique.windowControls.close()}>✕</button>
      </div>
    </header>
  );
};

export default TitleBar;
