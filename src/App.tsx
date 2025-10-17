import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { MemberPage } from './pages/MemberPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/member" element={<MemberPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
