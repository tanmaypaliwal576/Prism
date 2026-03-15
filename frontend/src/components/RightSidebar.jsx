import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserCheck, UserPlus } from 'lucide-react';

/* RIGHT SIDEBAR COMPONENT */
// Displays a list of suggested users to follow
const RightSidebar = () => {
  // List of suggested (or all other) users
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/auth/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestedUsers(res.data);
    } catch (error) {
      console.error("Failed to load suggested users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    try {
      const token = localStorage.getItem('token');
      
      // Optimistic Update
      setSuggestedUsers(prev => prev.map(u => 
        u.user_id === targetUserId ? { ...u, is_following: !isCurrentlyFollowing } : u
      ));

      if (isCurrentlyFollowing) {
         await axios.delete(`http://localhost:5000/api/follow/${targetUserId}`, {
           headers: { Authorization: `Bearer ${token}` }
         });
      } else {
         await axios.post(`http://localhost:5000/api/follow/${targetUserId}`, {}, {
           headers: { Authorization: `Bearer ${token}` }
         });
      }
    } catch (error) {
      // Revert if error
      setSuggestedUsers(prev => prev.map(u => 
        u.user_id === targetUserId ? { ...u, is_following: isCurrentlyFollowing } : u
      ));
      toast.error("Failed to update follow status");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="w-80 h-screen fixed right-0 top-0 hidden lg:block bg-slate-50 border-l border-slate-100 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Suggested Users</h2>
      
      {loading ? (
         <div className="flex justify-center p-4">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
         </div>
      ) : suggestedUsers.length === 0 ? (
         <p className="text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {suggestedUsers.map(user => {
            const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
            return (
              <div key={user.user_id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-100 text-slate-500 overflow-hidden flex items-center justify-center font-bold">
                    {user.profile_picture ? (
                      <img src={getImageUrl(user.profile_picture)} alt="pfp" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-sm">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 truncate">@{user.username.toLowerCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollowToggle(user.user_id, user.is_following)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all flex-shrink-0 ${
                    user.is_following 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 hover:shadow-md'
                  }`}
                >
                  {user.is_following ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
