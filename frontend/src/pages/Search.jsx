import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { Search as SearchIcon, User, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* SEARCH COMPONENT */
// Allows users to find other users by username
const Search = () => {
  // The text the user has typed into the search bar
  const [query, setQuery] = useState('');
  // The matching users returned from the backend
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounce logic: don't hit the API on every single keystroke.
  // Wait 500ms after the user stops typing before making the request.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // If the query is not empty, perform the API search
      if (query.trim() !== '') {
        performSearch(query);
      } else {
        // If query is empty, clear the results
        setUsers([]);
      }
    }, 500);

    // Cleanup function runs if the `query` changes again before 500ms is up,
    // cancelling the previous timeout.
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/search/users?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[40%] bg-violet-100/50 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <div className="z-20 relative hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto h-screen custom-scrollbar flex flex-col items-center">
        
        <div className="w-full max-w-2xl mt-8">
          <div className="relative mb-8 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-slate-700 font-medium text-lg placeholder-slate-400"
              placeholder="Search Prism..."
            />
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[300px]">
            {loading ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              </div>
            ) : query.trim() === '' ? (
              <div className="text-center p-10 text-slate-400 flex flex-col items-center">
                <SearchIcon size={48} className="mb-4 text-slate-200" />
                <p>Start typing to search users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No users found.</p>
                ) : (
                  users.map(user => (
                    <div 
                      key={user.user_id} 
                      onClick={() => navigate(`/profile/${user.user_id}`)}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        {user.profile_picture ? (
                          <img src={getImageUrl(user.profile_picture)} alt="pfp" className="w-full h-full object-cover" />
                        ) : (
                           user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{user.username}</p>
                        <p className="text-slate-500 text-sm truncate">{user.bio || `@${user.username.toLowerCase()}`}</p>
                      </div>
                      <button className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-colors">
                        View Profile
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Search;
