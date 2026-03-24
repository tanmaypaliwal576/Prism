import React, { useEffect, useState } from 'react';
import { Home, Search, Heart, PlusSquare, User, LogOut, Shield } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

/* SIDEBAR COMPONENT */
// Displays the main navigation menu on the left side of the screen
const Sidebar = () => {
  const navigate = useNavigate();
  // Stores the basic profile details (name, picture) of the logged-in user
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserAndNotifs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
        // Removed notifications
      } catch (error) {
        console.error("Failed to load user info in sidebar", error);
      }
    };
    fetchUserAndNotifs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login"; // Force full reload to update App route state
  };

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
      isActive ? 'bg-violet-50 text-violet-900' : 'hover:bg-slate-50 text-slate-600'
    }`;

  const navLinkClassWithBadge = ({ isActive }) => 
    `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors justify-between ${
      isActive ? 'bg-violet-50 text-violet-900' : 'hover:bg-slate-50 text-slate-600'
    }`;

  const initial = userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : 'U';

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex flex-col justify-between py-6 px-4">
      
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500"></div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-900 to-violet-600">Prism</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink to="/" className={navLinkClass}>
            <Home size={20} />
            Home
          </NavLink>
          {/* Note: We removed the Explore page link per request. Search functionality can be added later as a page or modal */}
          <NavLink to="/search" className={navLinkClass}>
            <Search size={20} />
            Search
          </NavLink>
          {/* Notifications removed from here */}
          <NavLink to="/create" className={navLinkClass}>
            <PlusSquare size={20} />
            Create
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            <User size={20} />
            Profile
          </NavLink>
          {userProfile?.is_admin && (
            <NavLink to="/admin" className={navLinkClass}>
              <Shield size={20} />
              Admin
            </NavLink>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 overflow-hidden flex items-center justify-center font-bold">
              {userProfile?.profile_picture ? (
                <img src={getImageUrl(userProfile.profile_picture)} alt="pfp" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-violet-500 text-white flex items-center justify-center">
                  {initial}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate w-32">{userProfile?.name || userProfile?.username || 'User'}</p>
              <p className="text-xs text-slate-500 truncate w-32">@{userProfile?.username || 'user'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 rounded-xl ml-2" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
