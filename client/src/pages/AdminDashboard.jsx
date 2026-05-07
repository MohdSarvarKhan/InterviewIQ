import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminDashboard() {
  const { userData } = useSelector((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If we already know the user is not an admin, we can redirect early
    if (userData && !userData.isAdmin) {
      navigate('/');
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const result = await axios.get(ServerUrl + '/api/admin/stats', { withCredentials: true });
        setStats(result.data);
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
        setError("You do not have permission to view this page.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [userData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 font-medium text-lg mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-10 px-4 sm:px-6 pt-28 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Overview of InterviewIQ metrics</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Users</span>
            <span className="text-4xl font-bold text-gray-800 dark:text-white">{stats.totalUsers}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Interviews</span>
            <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalInterviews}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Completed Interviews</span>
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.completedInterviews}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-colors">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Daily Active Users</span>
            <span className="text-4xl font-bold text-orange-500 dark:text-orange-400">{stats.activeUsersToday}</span>
          </div>
        </div>

        {/* Top Users Table */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Top Users (By Streak & Credits)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 transition-colors">
                {stats.topUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">🔥 {user.streak || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.credits || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
