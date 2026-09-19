import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateProfile from './pages/CreateProfile';
import EmergencyView from './pages/EmergencyView';
import ResponderAccess from './pages/ResponderAccess';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateProfile />} />
        <Route path="/emergency/:qrId" element={<EmergencyView />} />
        <Route path="/emergency/:qrId/responder" element={<ResponderAccess />} />
      </Routes>
    </BrowserRouter>
  );
}
