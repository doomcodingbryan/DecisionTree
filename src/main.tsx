import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Canvas from './components/Canvas';
import Home, { AccountPage, FolderPage } from './components/Home';
import Landing from './components/Landing';
import Login from './components/Login';
import { useGraph } from './store';
import { sampleEdges, sampleNodes } from './data/sampleGraph';
import './index.css';

// ponytail: hash router — three routes don't justify react-router
function App() {
  const [hash, setHash] = useState(window.location.hash);
  // ponytail: fake auth — localStorage flag, no backend; swap for real auth when one exists
  const [user, setUser] = useState(() => localStorage.getItem('gps-user'));
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      // logout clears the flag then navigates — re-read it here so no reload is needed
      setUser(localStorage.getItem('gps-user'));
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const app = appRoute(hash);
  if (!app) return <Landing />;
  if (!user)
    return (
      <Login
        onLogin={(name) => {
          localStorage.setItem('gps-user', name);
          setUser(name);
        }}
      />
    );
  return app;
}

// app screens sit behind the login gate; anything unmatched falls back to Landing
function appRoute(hash: string) {
  const treeId = hash.match(/^#\/t\/(.+)$/)?.[1];
  if (treeId) return <Canvas key={treeId} treeId={treeId} />;
  const folderName = hash.match(/^#\/f\/(.+)$/)?.[1];
  if (folderName)
    return (
      <FolderPage key={folderName} name={decodeURIComponent(folderName)} />
    );
  if (hash.startsWith('#/flows')) return <FolderPage key="all" />;
  if (hash.startsWith('#/plans')) return <Home />;
  if (hash.startsWith('#/account')) return <AccountPage />;
  if (hash.startsWith('#/sample')) return <SampleTree />;
  return null;
}

// find-or-create the sample plan — runs behind the login gate, so bouncing
// off the login wall never leaves orphans, and repeat clicks never duplicate
function SampleTree() {
  useEffect(() => {
    const s = useGraph.getState();
    // ponytail: matched by name; a renamed sample just gets a fresh one
    const existing = Object.values(s.trees).find(
      (t) => t.name === 'Sample Game Plan',
    );
    const id =
      existing?.id ?? s.createTree('Sample Game Plan', sampleNodes, sampleEdges);
    // replace: back from the sample shouldn't revisit this redirect
    window.location.replace(`#/t/${id}`);
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
