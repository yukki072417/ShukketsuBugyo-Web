import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean | null;
  user: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    const token = localStorage.getItem('token');
    return token ? true : false;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setUser(token ? JSON.parse(atob(token.split('.')[1])) : null);
    setIsAuthenticated(token ? true : false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};