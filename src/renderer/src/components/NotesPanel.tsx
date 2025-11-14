import { useEffect, useState } from 'react';

const NotesPanel = () => {
  const [notes, setNotes] = useState<string>(() => localStorage.getItem('pg-notes') ?? '');

  useEffect(() => {
    localStorage.setItem('pg-notes', notes);
  }, [notes]);

  return (
    <div>
      <h3>Notes rapides</h3>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        style={{ width: '100%', minHeight: '160px', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--pg-text)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );
};

export default NotesPanel;
