import React, { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import SocialGlassPage from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

// Toaster is a component from react-hot-toast used to show popup notifications
import { Toaster } from "react-hot-toast";
// Import routing components to handle navigation between different pages without reloading the browser
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const App = () => {

  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Optionally listen to changes in local storage from other tabs
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (

    <Router>

      <Toaster position="top-center" reverseOrder={false} />

      <Routes>

        {/* Home Route */}
        {/* If the user has a token, show them the Home page. Otherwise, Navigate (redirect) them to the login page */}
        <Route
          path="/"
          element={
            token ? <SocialGlassPage /> : <Navigate to="/login" />
          }
        />

        {/* Search */}
        <Route
          path="/search"
          element={
            token ? <Search /> : <Navigate to="/login" />
          }
        />

        {/* Create Post */}
        <Route
          path="/create"
          element={
            token ? <CreatePost /> : <Navigate to="/login" />
          }
        />


        {/* Profile */}
        <Route
          path="/profile"
          element={
            token ? <Profile /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile/:userId"
          element={
            token ? <Profile /> : <Navigate to="/login" />
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            token ? <Navigate to="/" /> : <Auth />
          }
        />

      </Routes>

    </Router>

  );

};

export default App;