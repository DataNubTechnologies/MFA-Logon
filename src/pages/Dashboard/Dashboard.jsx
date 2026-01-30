import { 
  Shield, 
  Users, 
  Key, 
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'MFA Enabled',
      value: '2,341',
      change: '+8.2%',
      trend: 'up',
      icon: Shield,
      color: 'success'
    },
    {
      title: 'Auth Requests (24h)',
      value: '15,892',
      change: '+24.1%',
      trend: 'up',
      icon: Key,
      color: 'info'
    },
    {
      title: 'Failed Attempts',
      value: '127',
      change: '-5.3%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'warning'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'John Smith',
      action: 'MFA Login Successful',
      method: 'Authenticator App',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'MFA Setup Completed',
      method: 'SMS',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      user: 'Mike Wilson',
      action: 'Failed Login Attempt',
      method: 'Hardware Token',
      time: '32 minutes ago',
      status: 'failed'
    },
    {
      id: 4,
      user: 'Emily Brown',
      action: 'Password Reset with MFA',
      method: 'Email OTP',
      time: '1 hour ago',
      status: 'success'
    },
    {
      id: 5,
      user: 'David Lee',
      action: 'MFA Method Changed',
      method: 'Biometric',
      time: '2 hours ago',
      status: 'success'
    }
  ];

  const mfaMethods = [
    { name: 'Authenticator App', count: 1245, percentage: 53 },
    { name: 'SMS OTP', count: 678, percentage: 29 },
    { name: 'Hardware Token', count: 289, percentage: 12 },
    { name: 'Biometric', count: 129, percentage: 6 }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          Overview of your MFA authentication system
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.trend}`}>
                {stat.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card title="Recent Activity" icon={Activity} className="activity-card">
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-status ${activity.status}`}>
                  {activity.status === 'success' ? <CheckCircle /> : <AlertTriangle />}
                </div>
                <div className="activity-details">
                  <div className="activity-header">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">
                      <Clock />
                      {activity.time}
                    </span>
                  </div>
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-method">{activity.method}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="MFA Methods Distribution" icon={Shield} className="methods-card">
          <div className="methods-list">
            {mfaMethods.map((method, index) => (
              <div key={index} className="method-item">
                <div className="method-header">
                  <span className="method-name">{method.name}</span>
                  <span className="method-count">{method.count} users</span>
                </div>
                <div className="method-bar">
                  <div 
                    className="method-bar-fill" 
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <span className="method-percentage">{method.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
