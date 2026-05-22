import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ItineraryDetail from './pages/ItineraryDetail';
import SharedItinerary from './pages/SharedItinerary';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">TripForge</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">TripForge</div>
      </div>
    );
  }
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/itinerary/:id"
        element={
          <PrivateRoute>
            <ItineraryDetail />
          </PrivateRoute>
        }
      />
      <Route path="/share/:shareId" element={<SharedItinerary />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
