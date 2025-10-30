// src/pages/logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/teacher/login");
  }, [navigate]);

  return null; // 何も表示しない
};

export default Logout;