import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthGate } from './components/AuthGate';
import { DeveloperGate } from './components/DeveloperGate';
import { AuthProvider } from './lib/auth';
import { Dashboard } from './pages/Dashboard';
import { DeveloperPanel } from './pages/DeveloperPanel';
import { Docs } from './pages/Docs';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
