import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreateQuizPage } from './pages/quiz/CreateQuizPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quiz/create" element={<CreateQuizPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
