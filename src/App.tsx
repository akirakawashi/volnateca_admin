import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateQuizPage } from './pages/quiz/CreateQuizPage';
import { PostToWallPage } from './pages/wall_post/PostToWallPage';

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quiz/create" element={<CreateQuizPage />} />
          <Route path="/wall/post" element={<PostToWallPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
    </ThemeProvider>
  );
}
