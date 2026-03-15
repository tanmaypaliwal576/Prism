# 🌈 Prism — Social Media Web Application

Prism is a **full-stack social media web application** that allows users to create posts, discover other users, and interact with content through a modern web interface.

The project demonstrates core concepts of **database management, REST API development, authentication, and full-stack application architecture**.

Prism is built using the **ERN Stack (Express.js, React, Node.js)** with a **SQL relational database** for structured data storage.

---

## ✨ Features

🔐 **User Authentication**  
Secure login and signup functionality.

📸 **Create & Share Posts**  
Users can upload images with captions and share them.

❤️ **Post Interaction**  
Users can interact with posts through likes.

🔎 **User Search**  
Users can search and discover other profiles.

👤 **User Profiles**  
Each user has a profile displaying their posts and activity.

🖥 **Modern UI Dashboard**  
Responsive interface built with React components.

---

## 🧰 Tech Stack

### Frontend
- React
- Vite
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQL Database (MySQL / PostgreSQL)

### Additional Libraries
- Multer (file upload handling)
- dotenv (environment variables)
- JWT Authentication

---

## 🏗 System Architecture

The application follows a **three-tier architecture**:

Frontend handles the **user interface**,  
Backend manages **API requests and business logic**,  
SQL database stores **structured relational data**.


Frontend (React)
│
▼
REST API (Express.js)
│
▼
SQL Database



---

## 📂 Project Structure

Prism
│
├── backend
│ ├── config
│ │ └── database.js
│ │
│ ├── middlewares
│ │ └── auth.middleware.js
│ │
│ ├── routes
│ ├── controllers
│ └── index.js
│
├── frontend
│ └── src
│ │
│ ├── components
│ │ ├── PostCard.jsx
│ │ ├── Sidebar.jsx
│ │ └── RightSidebar.jsx
│ │
│ ├── pages
│ │ ├── Auth.jsx
│ │ ├── Home.jsx
│ │ ├── CreatePost.jsx
│ │ ├── Profile.jsx
│ │ └── Search.jsx
│ │
│ ├── App.jsx
│ └── main.jsx
│
└── README.md



---

## 🖼 Application Screens

### Home Feed
Displays posts shared by users with interaction options such as likes.

### Search Users
Allows users to search and discover other users within the platform.

### Create Post
Users can upload an image and caption to create a new post.

### Profile Page
Displays user information, posts, and profile details.

---

## 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Full-stack ERN application development  
- REST API design using Express  
- SQL database schema design  
- Authentication using middleware  
- File upload handling in web applications  
- Modular React component architecture

---

## 👨‍💻 Author

**Tanmay Paliwal**  
B.Tech Computer Science  
NMIMS Indore  

GitHub:  
https://github.com/tanmaypaliwal576
