interface Props {
  mods: any[];
}

const ModsManager = ({ mods }: Props) => {
  return (
    <div>
      <h3>Mods</h3>
      <button onClick={() => window.pateGraphique.mods.reload()}>Recharger les mods</button>
      <button onClick={() => window.pateGraphique.mods.openFolder()} style={{ marginLeft: '8px' }}>
        Ouvrir le dossier
      </button>
      <ul style={{ marginTop: '12px', listStyle: 'none', padding: 0 }}>
        {mods.map((mod) => (
          <li key={mod.name}>{mod.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ModsManager;
