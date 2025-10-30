import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';
import "../shared/languages/configs";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { Header, Sidebar } from '../widgets';
import { Login, ProtectedRoute, Logout, AuthProvider } from '../features/auth';
import { default as Attendance } from '../features/attendance/pages/attendance';
import Lessons from '../features/lessons/pages/Lessons';
import { SchoolSettings } from '../features/settings';

import './App.css';
import Timetable from '../features/timetables/pages/Timetable';
import AttendanceStatistics from '../features/lessons/pages/AttendanceStatistics';

const AppContent = () => {
  const location = useLocation();
  
  useEffect(() => {    
    const savedLang = localStorage.getItem('language') || 'ja';
    localStorage.setItem('language', i18n.language);
    i18n.changeLanguage(savedLang);
  }, []);

  const isLoginPage = location.pathname === '/teacher/login';

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        {!isLoginPage && <Sidebar />}
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/teacher/login" />} />
            <Route path="/teacher/login" element={<Login />} />
            <Route path="/teacher/main/logout" element={<Logout />} />
            <Route
              path="/teacher/main/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="school-settings" element={<SchoolSettings />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="lessons" element={<Lessons />} />
                    <Route path="lessons/attendance" element={<AttendanceStatistics />} />
                    <Route path="timetable" element={<Timetable />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;