import { useEffect, useState } from 'react';

interface PasswordEntry {
  id: string;
  url: string;
  username: string;
  password: string;
}

const PasswordManager = () => {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [form, setForm] = useState({ url: '', username: '', password: '' });

  useEffect(() => {
    window.pateGraphique.password.list().then((list: PasswordEntry[]) => setEntries(list));
  }, []);

  const save = async () => {
    await window.pateGraphique.password.save({ ...form, createdAt: Date.now(), id: `${form.url}:${form.username}` });
    const list = await window.pateGraphique.password.list();
    setEntries(list);
  };

  return (
    <div>
      <h3>Mots de passe</h3>
      <input
        placeholder="URL"
        value={form.url}
        onChange={(event) => setForm({ ...form, url: event.target.value })}
        style={{ width: '100%', marginBottom: '4px' }}
      />
      <input
        placeholder="Utilisateur"
        value={form.username}
        onChange={(event) => setForm({ ...form, username: event.target.value })}
        style={{ width: '100%', marginBottom: '4px' }}
      />
      <input
        placeholder="Mot de passe"
        type="password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <button onClick={save}>Enregistrer</button>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
        {entries.map((entry) => (
          <li key={entry.id} style={{ marginBottom: '8px' }}>
            <strong>{entry.url}</strong>
            <div>{entry.username}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordManager;
