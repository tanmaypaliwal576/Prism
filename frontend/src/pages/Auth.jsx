import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* AUTHENTICATION COMPONENT */
// Handles both Login and Registration functionalities in a single page
const Auth = () => {
  // Toggle between 'Log In' UI and 'Sign Up' UI
  const [isLogin, setIsLogin] = useState(true);
  // Loading state to disable buttons while API request is in progress
  const [loading, setLoading] = useState(false);
  // Holds all form input values
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Triggered when the user clicks the submit button (Sign In / Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page on form submit
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        // Send email and password to the backend to authenticate
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem("token", res.data.token);
        toast.success("Login successful!");
        window.location.href = "/";
      } else {
        await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        toast.success("Registration successful! Please login.");
        setIsLogin(true); // Switch to login view
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 p-4">
      {/* Dynamic Backgrounds matching Prism brand */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-violet-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Auth Card */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white max-w-md w-full z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500"></div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-900 to-violet-600">Prism</span>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          {isLogin ? "Enter your details to sign in" : "Sign up to start sharing moments"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-slate-700"
                  placeholder="Sarah Chen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username (Unique)</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-slate-700"
                  placeholder="sarah_chen_99"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-slate-700"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-slate-700"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-violet-600 font-semibold hover:text-violet-800 transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
