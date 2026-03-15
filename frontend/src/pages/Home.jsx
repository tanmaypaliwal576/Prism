import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';

/* HOME COMPONENT (MAIN FEED) */
// Displays the main feed where users can see posts from everyone or followers
const Home = () => {
  // Array to hold the list of posts fetched from the backend
  const [posts, setPosts] = useState([]);
  // Loading indicator for the initial data fetch
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the component is first rendered to the screen
  useEffect(() => {
    fetchPosts();
  }, []);

  // Function to fetch the feed data from the server
  const fetchPosts = async () => {
    try {
      // Get the authentication token securely stored in localStorage
      const token = localStorage.getItem("token");
      
      // Make a GET request to the feed endpoint, passing the token in the Headers
      const res = await axios.get("http://localhost:5000/api/posts/feed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Gradients using pure Tailwind */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-200/30 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <div className="z-20 relative hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Feed Content */}
      <div className="flex-1 lg:mr-80 p-4 md:p-8 z-10 overflow-y-auto h-screen custom-scrollbar">
        
        {/* Header styling like the image */}
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome to Prism</h1>
          <p className="text-slate-500 font-medium text-sm">See what's happening with your friends</p>
        </div>

        {/* Posts Container */}
        <div className="max-w-3xl mx-auto pb-10">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500">No posts to show right now.</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.post_id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar for Suggested Users */}
      <RightSidebar />
      
    </div>
  );
};

export default Home;
