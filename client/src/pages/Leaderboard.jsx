import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await axios.get(ServerUrl + '/api/dashboard/leaderboard');
        setUsers(result.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-10 px-4 sm:px-6 pt-28 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">Community Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Top users ranked by consistency and practice</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No users on the leaderboard yet. Be the first to build a streak!
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user, index) => (
                <motion.li 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index} 
                  className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 text-xl' :
                      index === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-lg' :
                      'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Credits: {user.credits || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-full border border-orange-100 dark:border-orange-800">
                    <span className="text-xl">🔥</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{user.streak} Day Streak</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
