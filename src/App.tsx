import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ArjenHubBoot } from './components/ArjenHubBoot';
import { AuthGate } from './components/AuthGate';
import { DeveloperGate } from './components/DeveloperGate';
import { AuthProvider } from './lib/auth';
import { supabaseConfigured } from './lib/supabase';
import { Dashboard } from './pages/Dashboard';
import { DeveloperPanel } from './pages/DeveloperPanel';
import { Docs } from './pages/Docs';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

function MissingEnvScreen() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        margin: '0 auto',
        maxWidth: 520,
        padding: '4rem 1.25rem',
      }}
    >
      <h1 style={{ fontSize: '1.35rem', margin: '0 0 0.75rem' }}>ArjenHub — config missing</h1>
      <p style={{ color: '#5c6066', lineHeight: 1.5, margin: '0 0 1rem' }}>
        Set these environment variables in Vercel (Project → Settings → Environment Variables),
        then redeploy:
      </p>
      <ul style={{ lineHeight: 1.7, margin: 0, paddingLeft: '1.2rem' }}>
        <li>
          <code>VITE_SUPABASE_URL</code>
        </li>
        <li>
          <code>VITE_SUPABASE_ANON_KEY</code>
        </li>
      </ul>
      <p style={{ color: '#5c6066', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '1.25rem' }}>
        Vite embeds them at build time — changing env alone is not enough; trigger a new
        production deploy after saving.
      </p>
    </main>
  );
}

export default function App() {
  if (!supabaseConfigured) {
    return <MissingEnvScreen />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ArjenHubBoot />
        <Routes>
          <Route element={<Landing />} path="/" />
          <Route element={<Docs />} path="/docs" />
          <Route element={<SignIn />} path="/giris" />
          <Route element={<SignUp />} path="/kayit" />
          <Route
            element={
              <AuthGate>
                <Dashboard />
              </AuthGate>
            }
            path="/panel"
          />
          <Route
            element={
              <AuthGate>
                <DeveloperGate>
                  <DeveloperPanel />
                </DeveloperGate>
              </AuthGate>
            }
            path="/panel/developer"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
