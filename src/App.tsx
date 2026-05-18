import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { checkAdminSession } from './api/auth';
import {
  ADMIN_UNAUTHORIZED_EVENT,
  buildAdminAuthHeader,
  clearStoredAdminAuthHeader,
  getStoredAdminAuthHeader,
  saveStoredAdminAuthHeader,
} from './auth/adminAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateQuizPage } from './pages/quiz/CreateQuizPage';
import { PostToWallPage } from './pages/wall_post/PostToWallPage';
import { MessageTemplatesPage } from './pages/message_templates/MessageTemplatesPage';

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    const storedAuth = getStoredAdminAuthHeader();
    if (!storedAuth) {
      setAuthStatus('unauthenticated');
      return;
    }

    let active = true;

    void checkAdminSession(storedAuth)
      .then(() => {
        if (active) {
          setAuthStatus('authenticated');
        }
      })
      .catch(() => {
        clearStoredAdminAuthHeader();
        if (active) {
          setAuthStatus('unauthenticated');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthStatus('unauthenticated');
    };

    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const handleLogin = async (login: string, password: string) => {
    const authHeader = buildAdminAuthHeader(login, password);
    await checkAdminSession(authHeader);
    saveStoredAdminAuthHeader(authHeader);
    setAuthStatus('authenticated');
  };

  const handleLogout = () => {
    clearStoredAdminAuthHeader();
    setAuthStatus('unauthenticated');
  };

  return (
    <ThemeProvider>
      {authStatus === 'authenticated' ? (
        <BrowserRouter>
          <AppLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/quiz/create" element={<CreateQuizPage />} />
              <Route path="/wall/post" element={<PostToWallPage />} />
              <Route path="/message-templates" element={<MessageTemplatesPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      ) : (
        <LoginPage checking={authStatus === 'checking'} onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}
