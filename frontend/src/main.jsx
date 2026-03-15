// StrictMode is a tool for highlighting potential problems in an application
import { StrictMode } from 'react'
// createRoot is the modern way to initialize a React application in React 18+
import { createRoot } from 'react-dom/client'
// Import global CSS styles (including Tailwind CSS directives)
import './index.css'
// Import the main App component which contains all our routes and logic
import App from './App.jsx'

// Find the HTML element with id 'root' and render our React app inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
