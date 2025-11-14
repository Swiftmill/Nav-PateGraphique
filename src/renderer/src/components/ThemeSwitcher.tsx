import { useState } from 'react';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('default');

  const applyTheme = () => {
    window.pateGraphique.theme.apply(theme);
  };

  return (
    <div>
      <h3>Thèmes</h3>
      <input
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        placeholder="Nom du thème"
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <button onClick={applyTheme}>Appliquer</button>
    </div>
  );
};

export default ThemeSwitcher;
