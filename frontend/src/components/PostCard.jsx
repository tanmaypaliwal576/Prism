import React, { useState } from 'react';
import { Trash2, Heart, MessageCircle, Bookmark } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

/* POST CARD COMPONENT */
// Represents a single post in the feed or profile, along with its actions (like, save, comment)
const PostCard = ({ post }) => {
  // Initialize 'liked' state based on what the API told us
  const [liked, setLiked] = useState(!!post.is_liked_by_user);
  // Keep track of the number of likes
  const [likesCount, setLikesCount] = useState(post.like_count || 0);
  // Initialize 'saved' state
  const [saved, setSaved] = useState(!!post.is_saved_by_user);
  
  // Comment section toggle and data
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {}
    }
  }, []);

  const handleLike = async () => {
    // Optimistic UI update: Instantly update the UI so it feels fast, 
    // even before the server has returned a success response.
    const previousLikedState = liked;
    const previousLikesCount = likesCount;

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/likes/${post.post_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      // Revert if API fails
      setLiked(previousLikedState);
      setLikesCount(previousLikesCount);
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  };

  const handleSave = async () => {
    const previousSavedState = saved;
    setSaved(!saved);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/saved/${post.post_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.action === "saved") {
         toast.success("Post saved!");
      }
    } catch (error) {
      setSaved(previousSavedState);
      toast.error("Failed to save post");
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/comments/${post.post_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/comments/${post.post_id}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/posts/delete/${post.post_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post deleted successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const initial = post.username ? post.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 w-full max-w-3xl mx-auto hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 overflow-hidden flex items-center justify-center font-bold">
            {post.profile_picture ? (
              <img src={getImageUrl(post.profile_picture)} alt="pfp" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-500 text-white flex items-center justify-center">
                {initial}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{post.username || "Unknown User"}</p>
            <p className="text-xs text-slate-400">posted recently</p>
          </div>
        </div>
        {currentUserId === post.user_id && (
          <button 
            onClick={handleDelete}
            className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
            title="Delete Post"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Caption */}
      <p className="text-sm text-slate-800 mb-4 whitespace-pre-wrap">
        {post.caption}
      </p>

      {/* Image */}
      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden bg-slate-100">
          <img 
            src={getImageUrl(post.image_url)} 
            alt="Post content" 
            className="w-full h-auto max-h-[500px] object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-2">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-sm font-medium ${liked ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:bg-slate-50 hover:text-pink-600'}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </button>
        
        <button 
          onClick={handleToggleComments}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-sm font-medium ${showComments ? 'bg-violet-50 text-violet-600' : 'text-slate-500 hover:bg-violet-50 hover:text-violet-600'}`}
        >
          <MessageCircle size={18} />
          Comment
        </button>

        <button 
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-sm font-medium ${saved ? 'text-amber-500 bg-amber-50' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          
          <div className="max-h-64 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
            {loadingComments ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.comment_id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 overflow-hidden flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {c.profile_picture ? (
                      <img src={getImageUrl(c.profile_picture)} alt="pfp" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        {c.username ? c.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-none p-3 flex-1">
                    <p className="text-xs font-bold text-slate-900 mb-1">{c.username}</p>
                    <p className="text-sm text-slate-700">{c.comment_text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handlePostComment} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default PostCard;
