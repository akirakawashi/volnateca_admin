import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { checkAdminSession, loginAdmin, logoutAdmin } from './api/auth';
import { ADMIN_UNAUTHORIZED_EVENT } from './auth/adminAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';

const ChartsPage = lazy(() =>
  import('./pages/charts/ChartsPage').then((module) => ({ default: module.ChartsPage })),
);
import { CreateQuizPage } from './pages/quiz/CreateQuizPage';
import { StorePrizesPage } from './pages/prizes/StorePrizesPage';
import { PrizeRedemptionsPage } from './pages/prizeRedemptions/PrizeRedemptionsPage';
import { TaskPromoCodeTaskPage } from './pages/taskPromoCode/TaskPromoCodeTaskPage';
import { PostToWallPage } from './pages/wall_post/PostToWallPage';
import { MessageTemplatesPage } from './pages/message_templates/MessageTemplatesPage';
import { BroadcastPage } from './pages/broadcast/BroadcastPage';
import { UserSearchPage } from './pages/users/UserSearchPage';
import { UserProfilePage } from './pages/users/UserProfilePage';

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let active = true;

    void checkAdminSession()
      .then(() => {
        if (active) {
          setAuthStatus('authenticated');
        }
      })
      .catch(() => {
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

  const handleLogin = async (login: string, password: string, adminToken: string) => {
    await loginAdmin(login, password, adminToken);
    setAuthStatus('authenticated');
  };

  const handleLogout = () => {
    void logoutAdmin().catch(() => undefined);
    setAuthStatus('unauthenticated');
  };

  return (
    <ThemeProvider>
      {authStatus === 'authenticated' ? (
        <BrowserRouter>
          <AppLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/charts"
                element={
                  <Suspense fallback={<p style={{ padding: 24 }}>Загрузка графиков…</p>}>
                    <ChartsPage />
                  </Suspense>
                }
              />
              <Route path="/quiz/create" element={<CreateQuizPage />} />
              <Route path="/tasks/promo-codes" element={<TaskPromoCodeTaskPage />} />
              <Route path="/store/prizes" element={<StorePrizesPage />} />
              <Route path="/store/redemptions" element={<PrizeRedemptionsPage />} />
              <Route path="/users" element={<UserSearchPage />} />
              <Route path="/users/:usersId" element={<UserProfilePage />} />
              <Route path="/wall/post" element={<PostToWallPage />} />
              <Route path="/message-templates" element={<MessageTemplatesPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      ) : (
        <LoginPage checking={authStatus === 'checking'} onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}
