// Import the multer library, which handles multipart/form-data for file uploads
import multer from "multer";

// Configure how and where files should be stored on the server
const storage = multer.diskStorage({
  // Define the destination folder for uploaded files
  destination: (req, file, cb) => {
    // We are passing 'null' for errors (no error), and "uploads/" as the target folder
    cb(null, "uploads/");
  },
  // Define how the uploaded file should be named to avoid overwriting existing files
  filename: (req, file, cb) => {
    // Prepend the current timestamp to make the filename unique (e.g., 16300000000-image.png)
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Initialize multer with the custom storage configuration
const upload = multer({ storage });

// Export the customized `upload` middleware to attach to routes handling files
export default upload;