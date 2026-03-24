import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { Shield, Trash2, Ban, UserCheck, Eye, Users, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch (e) { return null; }
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = token ? parseJwt(token)?.userId : null;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load admin data. Try again or check permissions.");
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/block`, 
        { is_blocked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${newStatus ? 'blocked' : 'unblocked'} successfully`);
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_blocked: newStatus } : u));
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.user_id !== userId));
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const totalUsers = users.length;
  const totalPosts = users.reduce((acc, u) => acc + (u.posts_count || 0), 0);
  const totalLikes = users.reduce((acc, u) => acc + (u.total_likes_received || 0), 0);
  const blockedUsers = users.filter(u => u.is_blocked).length;

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-violet-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <div className="z-20 relative hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 p-4 md:p-8 z-10 overflow-y-auto h-screen custom-scrollbar w-full">
        
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 font-medium">Platform overview and user management</p>
            </div>
          </div>

          {/* Stats Summary Area */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText size={24}/></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Posts</p>
                <p className="text-2xl font-bold text-slate-900">{totalPosts}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><Activity size={24}/></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Likes Received</p>
                <p className="text-2xl font-bold text-slate-900">{totalLikes}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Ban size={24}/></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Blocked Users</p>
                <p className="text-2xl font-bold text-slate-900">{blockedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">User Analytics & Management</h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold text-center">Posts</th>
                      <th className="p-4 font-semibold text-center">Followers</th>
                      <th className="p-4 font-semibold text-center">Following</th>
                      <th className="p-4 font-semibold text-center">Likes</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.user_id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 overflow-hidden flex-shrink-0">
                            {user.profile_picture ? (
                              <img src={getImageUrl(user.profile_picture)} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-violet-700">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name} {user.user_id === currentUserId && "(You)"}</p>
                            <p className="text-xs text-slate-500">@{user.username}</p>
                          </div>
                          {user.is_admin ? (
                            <span className="ml-2 text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">ADMIN</span>
                          ) : null}
                        </td>
                        <td className="p-4 text-center font-medium text-slate-700">{user.posts_count || 0}</td>
                        <td className="p-4 text-center font-medium text-slate-700">{user.followers_count || 0}</td>
                        <td className="p-4 text-center font-medium text-slate-700">{user.following_count || 0}</td>
                        <td className="p-4 text-center font-medium text-slate-700">{user.total_likes_received || 0}</td>
                        <td className="p-4 text-center">
                          {user.is_blocked ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Blocked</span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => navigate(`/profile/${user.user_id}`)}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View User Posts & Profile"
                            >
                              <Eye size={18} />
                            </button>
                            {user.user_id !== currentUserId && (
                              <button
                                onClick={() => handleBlockToggle(user.user_id, user.is_blocked)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.is_blocked 
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                                title={user.is_blocked ? "Unblock User" : "Block User"}
                              >
                                {user.is_blocked ? <UserCheck size={18} /> : <Ban size={18} />}
                              </button>
                            )}
                            {user.user_id !== currentUserId && !user.is_admin && (
                              <button
                                onClick={() => handleDeleteUser(user.user_id)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {!loading && users.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No users found.
              </div>
            )}
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default Admin;
