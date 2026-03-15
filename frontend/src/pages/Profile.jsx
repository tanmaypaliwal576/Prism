import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { ImagePlus, Edit3, X, Loader2, User } from 'lucide-react';
import { useParams } from 'react-router-dom';

/* PROFILE COMPONENT */
// Displays either the logged-in user's profile or another user's profile
const Profile = () => {
  // Extracts the `userId` from the URL if viewing someone else's profile (e.g. /profile/123)
  const { userId } = useParams();
  // If `userId` is missing from the URL, it must be the logged-in user's own profile (/profile)
  const isOwnProfile = !userId;
  
  // Stores all the fetched profile data (posts, followers count, bio, etc.)
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'saved'
  const [savedPosts, setSavedPosts] = useState([]);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [editPfp, setEditPfp] = useState(null);
  const [pfpPreview, setPfpPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
    if (isOwnProfile) {
      fetchSavedPosts();
      setActiveTab('posts'); // always reset
    }
  }, [userId]);

  // Fetches the primary profile information
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Determine which API endpoint to hit based on whose profile we are viewing
      const endpoint = isOwnProfile 
        ? "http://localhost:5000/api/auth/profile"
        : `http://localhost:5000/api/auth/profile/${userId}`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      if (isOwnProfile) {
        setEditData({ username: res.data.username, bio: res.data.bio || '' });
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/saved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPosts(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePfpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPfp(file);
      setPfpPreview(URL.createObjectURL(file));
    }
  };

  // Handles submitting the edit profile form
  const saveProfile = async (e) => {
    e.preventDefault(); // Stop normal form submission
    setEditLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // We use FormData instead of standard JSON because we are potentially sending a file (profile picture)
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('bio', editData.bio);
      if (editPfp) formData.append('profile_picture', editPfp);

      await axios.post("http://localhost:5000/api/auth/profile/edit", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("Profile updated");
      setIsEditing(false);
      fetchProfile(); // refresh
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setEditLoading(false);
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
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-violet-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <div className="z-20 relative hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto h-screen custom-scrollbar">
        
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
          </div>
        ) : profile ? (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mt-8">
            
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-violet-600 to-pink-500 w-full relative">
              <div className="absolute -bottom-16 left-8">
                <div 
                  className={`w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-5xl font-bold text-violet-600 shadow-sm overflow-hidden relative ${isOwnProfile ? 'group cursor-pointer' : ''}`} 
                  onClick={() => isOwnProfile && setIsEditing(true)}
                >
                  {profile.profile_picture ? (
                    <img src={getImageUrl(profile.profile_picture)} className="w-full h-full object-cover" alt="pfp" />
                  ) : (
                    profile.username.charAt(0).toUpperCase()
                  )}
                  {isOwnProfile && (
                     <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                       <Edit3 className="text-white w-8 h-8"/>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900">{profile.username}</h1>
                  <p className="text-slate-500 font-medium mb-2">{profile.handle}</p>
                  <p className="text-slate-700 text-sm max-w-lg">{profile.bio}</p>
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-6 py-2 bg-slate-100 text-slate-800 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{profile.postsCount}</p>
                  <p className="text-sm text-slate-500 font-medium">Posts</p>
                </div>
                <div className="text-center cursor-pointer">
                  <p className="text-2xl font-bold text-slate-900">{profile.followers}</p>
                  <p className="text-sm text-slate-500 font-medium">Followers</p>
                </div>
                <div className="text-center cursor-pointer">
                  <p className="text-2xl font-bold text-slate-900">{profile.following}</p>
                  <p className="text-sm text-slate-500 font-medium">Following</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <nav className="flex gap-6 mb-6">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className={`pb-2 font-semibold transition-colors ${activeTab === 'posts' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Posts
                  </button>
                  {isOwnProfile && (
                    <button 
                      onClick={() => setActiveTab('saved')}
                      className={`pb-2 font-semibold transition-colors ${activeTab === 'saved' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Saved
                    </button>
                  )}
                </nav>
                
                {/* Posts Feed */}
                <div className="mt-8">
                  {activeTab === 'posts' && (
                    profile.posts && profile.posts.length > 0 ? (
                      <div className="grid gap-6 auto-rows-max">
                        {profile.posts.map(post => (
                          <PostCard key={post.post_id} post={{...post, username: profile.username, profile_picture: profile.profile_picture}} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <ImagePlus size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-600 font-semibold mb-1">No posts yet</p>
                        <p className="text-slate-400 text-sm">When you share photos, they will appear on your profile.</p>
                      </div>
                    )
                  )}

                  {/* Saved Feed */}
                  {activeTab === 'saved' && (
                    savedPosts.length > 0 ? (
                       <div className="grid gap-6 auto-rows-max">
                        {savedPosts.map(post => (
                          <PostCard key={post.post_id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <ImagePlus size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-600 font-semibold mb-1">No saved posts</p>
                        <p className="text-slate-400 text-sm">Posts you save will securely appear here.</p>
                      </div>
                    )
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-20 text-slate-500">Profile data not found.</div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 mb-3 overflow-hidden flex justify-center items-center">
                   {pfpPreview ? (
                     <img src={pfpPreview} className="w-full h-full object-cover" alt="Preview" />
                   ) : profile.profile_picture ? (
                     <img src={getImageUrl(profile.profile_picture)} className="w-full h-full object-cover" alt="Current" />
                   ) : (
                     <User size={32} className="text-slate-400" />
                   )}
                </div>
                <label className="text-violet-600 font-semibold text-sm cursor-pointer hover:underline">
                  Change Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handlePfpChange} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={editData.username} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                <textarea 
                  name="bio"
                  value={editData.bio} 
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={editLoading}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors flex justify-center items-center gap-2 mt-4"
              >
                {editLoading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
