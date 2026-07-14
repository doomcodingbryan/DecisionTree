import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Canvas from './components/Canvas';
import Home, { FolderPage } from './components/Home';
import Landing from './components/Landing';
import './index.css';

// ponytail: hash router — three routes don't justify react-router
function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const treeId = hash.match(/^#\/t\/(.+)$/)?.[1];
  if (treeId) return <Canvas key={treeId} treeId={treeId} />;
  const folderName = hash.match(/^#\/f\/(.+)$/)?.[1];
  if (folderName)
    return (
      <FolderPage key={folderName} name={decodeURIComponent(folderName)} />
    );
  if (hash.startsWith('#/flows')) return <FolderPage key="all" />;
  if (hash.startsWith('#/plans')) return <Home />;
  return <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
