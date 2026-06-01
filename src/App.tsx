import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { checkAdminSession, loginAdmin, logoutAdmin } from './api/auth';
import { ADMIN_UNAUTHORIZED_EVENT } from './auth/adminAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { adminRoutes, type AdminRouteId } from './navigation/adminNavigation';
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

const adminRouteElements = {
  dashboard: <DashboardPage />,
  charts: (
    <Suspense fallback={<p style={{ padding: 24 }}>Загрузка графиков…</p>}>
      <ChartsPage />
    </Suspense>
  ),
  quizCreate: <CreateQuizPage />,
  taskPromoCodes: <TaskPromoCodeTaskPage />,
  storePrizes: <StorePrizesPage />,
  storeRedemptions: <PrizeRedemptionsPage />,
  users: <UserSearchPage />,
  userProfile: <UserProfilePage />,
  wallPost: <PostToWallPage />,
  messageTemplates: <MessageTemplatesPage />,
  broadcast: <BroadcastPage />,
} satisfies Record<AdminRouteId, ReactNode>;

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

  const handleLogin = async (login: string, password: string) => {
    await loginAdmin(login, password);
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
              {adminRoutes.map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={adminRouteElements[route.id]}
                />
              ))}
            </Routes>
          </AppLayout>
        </BrowserRouter>
      ) : (
        <LoginPage checking={authStatus === 'checking'} onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}
