// Import the JSON Web Token library used to create and verify tokens
import jwt from "jsonwebtoken";

// Middleware function to protect routes from unauthorized access
export const protect = (req, res, next) => {
  try {
    // Read the "Authorization" header from the incoming request
    const authHeader = req.headers.authorization;

    // Check if the user sent a token in the headers
    if (!authHeader) {
      // 401 Unauthorized: The request lacks valid authentication credentials
      return res.status(401).json({ message: "No token provided" });
    }

    // Split "Bearer <token>" and take just the `<token>` part
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret key. 
    // If successful, it decodes the token payload (e.g. user ID info).
    const decoded = jwt.verify(token, "secretkey");

    // Attach the decoded user payload to the req object 
    // so subsequent steps (routes) know exactly which user is making the request
    req.user = decoded; 
    // e.g. req.user contains req.user.userId

    // Pass control to the next middleware or actual route handler
    next();
  } catch (error) {
    // If the token is invalid, expired, or malformed, it triggers this error
    return res.status(401).json({ message: "Invalid token" });
  }
};