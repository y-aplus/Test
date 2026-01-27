import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import CreateQuizPage from './pages/CreateQuizPage';
import PresenterPage from './pages/PresenterPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  console.log('App component rendering...');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreateQuizPage />} />
          <Route path="present" element={<PresenterPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
