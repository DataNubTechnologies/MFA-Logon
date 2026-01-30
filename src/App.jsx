import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import UserPolicies from './pages/UserPolicies/UserPolicies';
import ActivityLog from './pages/ActivityLog/ActivityLog';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="user-policies" element={<UserPolicies />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
