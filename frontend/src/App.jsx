import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Friends from './pages/Friends';
import FriendDetail from './pages/FriendDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import ExpenseDetail from './pages/ExpenseDetail';
import Profile from './pages/Profile';
import CreateGroup from './pages/CreateGroup';
import SubscriptionsNew from './pages/SubscriptionsNew';
import Calculators from './pages/Calculators';
import CalculatorsRent from './pages/CalculatorsRent';
import CalculatorsRenters from './pages/CalculatorsRenters';
import CalculatorsFurniture from './pages/CalculatorsFurniture';
import CalculatorsGuest from './pages/CalculatorsGuest';
import CalculatorsNoise from './pages/CalculatorsNoise';
import CalculatorsTravel from './pages/CalculatorsTravel';
import Support from './pages/Support';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#212529',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#1CC29F', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E87722', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="friends" element={<Friends />} />
            <Route path="friends/:id" element={<FriendDetail />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/new" element={<CreateGroup />} />
            <Route path="groups/new/:type" element={<CreateGroup />} />
            <Route path="groups/:id" element={<GroupDetail />} />
            <Route path="expenses/:id" element={<ExpenseDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="subscriptions/new" element={<SubscriptionsNew />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="calculators/rent" element={<CalculatorsRent />} />
            <Route path="calculators/renters" element={<CalculatorsRenters />} />
            <Route path="calculators/renters/:state" element={<CalculatorsRenters />} />
            <Route path="calculators/furniture" element={<CalculatorsFurniture />} />
            <Route path="calculators/guest" element={<CalculatorsGuest />} />
            <Route path="calculators/noise" element={<CalculatorsNoise />} />
            <Route path="calculators/travel" element={<CalculatorsTravel />} />
            <Route path="support" element={<Support />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
