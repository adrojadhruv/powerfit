import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WorkoutPlans from './pages/WorkoutPlans';
import DietPlans from './pages/DietPlans';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';
import PlanGenerator from './pages/PlanGenerator';
import Exercises from './pages/Exercises';
import Profile from './pages/Profile';
import DietTracker from './pages/DietTracker';
import Journey from './pages/Journey';
import TrainerExercises from './pages/TrainerExercises';
import TrainerNutrition from './pages/TrainerNutrition';
import Landing from './pages/Landing';
import Layout from './components/Layout';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</span>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const TrainerRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'trainer' && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<WorkoutPlans />} />
        <Route path="/diets" element={<DietPlans />} />
        <Route path="/generator" element={<PlanGenerator />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/diet-tracker" element={<DietTracker />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/trainer/exercises" element={<TrainerRoute><TrainerExercises /></TrainerRoute>} />
        <Route path="/trainer/nutrition" element={<TrainerRoute><TrainerNutrition /></TrainerRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
