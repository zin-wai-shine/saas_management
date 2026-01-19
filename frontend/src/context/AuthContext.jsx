import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me()
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password, role, businessName) => {
    const response = await authAPI.register({ name, email, password, role, business_name: businessName });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isOwner = () => user?.role === 'owner';

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // If user has all permissions (super admin), return true
    if (user?.permissions?.includes('*') || user?.role === 'admin') {
      return true;
    }
    return user?.permissions?.includes(permission) || false;
  };

  // Check if user has all permissions for a feature section
  const hasAllPermissionsForSection = (section) => {
    const sectionPermissions = {
      dashboard: ['dashboard_view'],
      users: ['users_view', 'users_create', 'users_edit', 'users_delete'],
      websites: ['websites_view', 'websites_create', 'websites_edit', 'websites_delete'],
      plans: ['plans_view', 'plans_create', 'plans_edit', 'plans_delete'],
      subscriptions: ['subscriptions_view', 'subscriptions_create', 'subscriptions_edit', 'subscriptions_delete'],
      settings: ['settings_view', 'settings_manage'],
    };

    const requiredPermissions = sectionPermissions[section] || [];
    if (requiredPermissions.length === 0) return true;

    // Check if user has all required permissions for this section
    return requiredPermissions.every(perm => hasPermission(perm));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isOwner,
        hasPermission,
        hasAllPermissionsForSection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

