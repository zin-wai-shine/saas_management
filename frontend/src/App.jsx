import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLayout } from './components/AdminLayout';
import { UsersPage } from './pages/admin/UsersPage';
import { WebsitesPage } from './pages/admin/WebsitesPage';
import { PlansPage } from './pages/admin/PlansPage';
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { MessagesPage } from './pages/admin/MessagesPage';
import { ChatWidget } from './components/ChatWidget';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { GalleryPage } from './pages/GalleryPage';
import { DemoSitePage } from './pages/DemoSitePage';
import { PricingPage } from './pages/PricingPage';
import { SearchPage } from './pages/SearchPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:slug" element={<DemoSitePage />} />
          <Route path="/plans" element={<PricingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/websites"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <WebsitesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <PlansPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <SubscriptionsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <NotificationsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <MessagesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
