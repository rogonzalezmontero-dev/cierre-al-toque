import { createContext, useContext, useState, useEffect } from 'react';
import { sessionDB, userDB, turnDB, seedAdminIfEmpty } from '../db/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedAdminIfEmpty();
    turnDB.cleanup(); // limpia turnos corruptos sin id o fecha
    const saved = sessionDB.get();
    if (saved) {
      // Re-fetch to get latest user data
      const fresh = userDB.getById(saved.id);
      setUser(fresh || null);
    }
    setLoading(false);
  }, []);

  const login = (cedula, password) => {
    const u = userDB.authenticate(cedula, password);
    if (!u) return { ok: false, error: 'Cédula o contraseña incorrecta' };
    sessionDB.set(u);
    setUser(u);
    return { ok: true };
  };

  const logout = () => {
    sessionDB.clear();
    setUser(null);
  };

  const refreshUser = () => {
    if (user) {
      const fresh = userDB.getById(user.id);
      setUser(fresh || null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
