import { useState } from 'react';

interface DownloadItem {
  url: string;
}

const DownloadManager = () => {
  const [url, setUrl] = useState('');

  const startDownload = () => {
    if (!url) return;
    window.pateGraphique.downloads.start(url);
    setUrl('');
  };

  return (
    <div>
      <h3>Téléchargements</h3>
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="URL du fichier"
        style={{ width: '100%', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}
      />
      <button onClick={startDownload}>Télécharger</button>
    </div>
  );
};

export default DownloadManager;
