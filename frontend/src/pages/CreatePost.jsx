import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* CREATE POST COMPONENT */
// Allows users to create a new post with an image and a caption
const CreatePost = () => {
  // Text content of the post
  const [caption, setCaption] = useState('');
  // The actual File object selected by the user
  const [image, setImage] = useState(null);
  // A temporary local URL to show the user a preview of the image they selected
  const [preview, setPreview] = useState(null);
  // Processing state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handles the final submission of the post
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure an image is selected because it's required in this app
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // We need user ID, we can decode JWT or temporarily pass a default or use the profile endpoint.
      // Wait, in auth login we get: user: { id, username, email }. 
      // Let's get user from profile endpoint first, or assume user_id is passed if backend needs it.
      // Actually, since backend `/create` route requires `user_id`, we fetch it if we don't have it locally.
      
      let userId;
      // Fetch profile to get user_id fast
      const profileRes = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      userId = profileRes.data.id;

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('caption', caption);
      formData.append('image', image);

      await axios.post('http://localhost:5000/api/posts/create', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <div className="z-20 relative hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto h-screen custom-scrollbar flex flex-col items-center">
        
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create New Post</h1>
          <p className="text-slate-500 font-medium text-sm">Share your moments with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Image</label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl hover:border-violet-500 transition-colors bg-slate-50 flex justify-center items-center h-64 overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <ImagePlus className="text-slate-400 mb-2" size={40} />
                  <p className="text-sm text-slate-500 font-medium">Click to browse or drag & drop</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind? #hashtags"
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 resize-none text-slate-700"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity focus:ring-2 focus:ring-offset-2 flex justify-center items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> Posting...</> : 'Share Post'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CreatePost;
