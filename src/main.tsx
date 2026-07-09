import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Canvas from './components/Canvas';
import Home from './components/Home';
import './index.css';

// ponytail: hash router — two routes don't justify react-router
function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const treeId = hash.match(/^#\/t\/(.+)$/)?.[1];
  return treeId ? <Canvas key={treeId} treeId={treeId} /> : <Home />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
