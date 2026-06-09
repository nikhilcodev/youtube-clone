# ▶️ YouTube Clone — MERN Full Stack Application

> React · Node.js · Express · MongoDB · JWT Authentication

## 🔗 Github Repository Link

You can access the full source code, commit history, and project structure here:

➡️ **https://github.com/nikhilcodev/youtube-clone**

This is a complete **YouTube Clone** built with the MERN stack (MongoDB, Express, React, Node.js) as a capstone project. It replicates core YouTube features including video discovery, playback, user authentication, channel management, and a comment system.

---

## 🎯 Project Overview

The YouTube Clone is a full-stack web application that demonstrates real-world development practices. Users can:

- **Authenticate** with secure JWT-based login/registration
- **Upload & manage** videos within their own channels
- **Search & filter** videos by title and category
- **Watch videos** with like/dislike functionality and comments
- **Create & manage** channels with subscriber tracking
- **Interact** with a responsive, feature-rich user interface

This project implements **all rubric requirements** across frontend, backend, search/filter, responsiveness, and code quality.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** CSS3 + Responsive Design
- **Module System:** ES Modules (ESM)

### Backend

- **Runtime:** Node.js v25+
- **Framework:** Express.js v5
- **Database:** MongoDB 9.4
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Environment:** dotenv
- **Module System:** ES Modules (ESM)

### DevOps & Tools

- **Version Control:** Git with feature branching
- **Package Manager:** npm
- **Dev Server:** Vite (frontend), nodemon (backend)

---

## 📁 Repository Structure

```
youtube-clone/
│
├── README.md                      
├── Problem_Statement.md           
│
├── Backend/                       # Node.js & Express API
│   │                        
│   ├── package.json
│   ├── app.js
│   ├── .env.example
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── data/
│
└── Frontend/                      # React application
    │
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── public/
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** for version control
- **npm** (comes with Node.js)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/nikhilcodev/youtube-clone 
cd youtube-clone
```

#### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# Example:
# MONGO_URI=mongodb://localhost:27017/youtube-clone
# JWT_SECRET=your_secret_key
# PORT=5000

# Seed sample data
npm run seed

# Start development server
npm run dev
```

Server runs on: **`http://localhost:5000`**

#### 3. Frontend Setup

```bash
cd ../Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs on: **`http://localhost:5173`**

#### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 🎬 Core Features

### User Authentication

- ✅ User registration with email validation
- ✅ Secure JWT-based login/logout
- ✅ Protected routes for authenticated users
- ✅ User profile management

### Video Management

- ✅ Video upload with metadata (title, description, category, thumbnail)
- ✅ Video playback with custom player
- ✅ Like/Dislike functionality with toggle
- ✅ View count tracking
- ✅ Full CRUD operations for video owners

### Comment System

- ✅ Add comments to videos
- ✅ Edit personal comments
- ✅ Delete personal comments
- ✅ Display comments with timestamps
- ✅ Comment author information

### Channel Management

- ✅ Create channels (authenticated users only)
- ✅ Edit channel details (owner only)
- ✅ Delete channels (owner only)
- ✅ View channel analytics (video count, subscribers)
- ✅ Manage channel videos

### Search & Discovery

- ✅ Search videos by title (case-insensitive)
- ✅ Filter by category (7+ categories: Music, Gaming, Education, Entertainment, Sports, Tech, Other)
- ✅ Dynamic filter button implementation
- ✅ Responsive grid layout for video discovery

### Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop full-screen layout
- ✅ Touch-friendly navigation

---

## 🔐 Security Features

- ✅ JWT-based authentication with 7-day expiry
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ CORS configured for secure cross-origin requests
- ✅ Ownership verification for sensitive operations
- ✅ Input validation on all fields
- ✅ Protected API routes with middleware

---

## 📝 API Endpoints Overview

### Authentication

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user (protected)

### Videos

- `GET /api/videos` — Get all videos with search/filter
- `GET /api/videos/:id` — Get single video
- `POST /api/videos` — Create video (protected)
- `PUT /api/videos/:id` — Update video (owner only)
- `DELETE /api/videos/:id` — Delete video (owner only)
- `PUT /api/videos/:id/like` — Like video (protected)
- `PUT /api/videos/:id/dislike` — Dislike video (protected)

### Channels

- `GET /api/channels` — Get all channels
- `GET /api/channels/:id` — Get channel with videos
- `POST /api/channels` — Create channel (protected)
- `PUT /api/channels/:id` — Update channel (owner only)
- `DELETE /api/channels/:id` — Delete channel (owner only)

### Comments

- `GET /api/comments/:videoId` — Get comments for video
- `POST /api/comments/:videoId` — Add comment (protected)
- `PUT /api/comments/:commentId` — Edit comment (author only)
- `DELETE /api/comments/:commentId` — Delete comment (author only)

---

## 🗄️ Database Schema

### User

```javascript
{
  userId: String,          // Unique custom ID
  username: String,        // 3-20 characters, unique
  email: String,           // Valid email, unique
  password: String,        // Bcrypt hashed
  avatar: String,          // Profile picture URL
  channels: [ObjectId],    // References to channels
  createdAt: Date,
  updatedAt: Date
}
```

### Channel

```javascript
{
  channelId: String,       // Unique custom ID
  channelName: String,     // Channel name
  owner: ObjectId,         // Reference to user
  description: String,     // Channel description
  channelBanner: String,   // Banner image URL
  subscribers: Number,     // Subscriber count
  videos: [ObjectId],      // References to videos
  createdAt: Date,
  updatedAt: Date
}
```

### Video

```javascript
{
  videoId: String,         // Unique custom ID
  title: String,           // 3-200 characters
  thumbnailUrl: String,    // Thumbnail URL
  videoUrl: String,        // YouTube video URL
  description: String,     // Video description
  channelId: ObjectId,     // Reference to channel
  uploader: ObjectId,      // Reference to user
  views: Number,           // View count
  likes: Number,           // Like count
  dislikes: Number,        // Dislike count
  likedBy: [ObjectId],     // User IDs who liked
  dislikedBy: [ObjectId],  // User IDs who disliked
  category: String,        // Video category
  uploadDate: Date,        // Upload date
  comments: [ObjectId],    // References to comments
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  commentId: String,       // Unique custom ID
  videoId: ObjectId,       // Reference to video
  userId: ObjectId,        // Reference to user
  text: String,            // Comment text (1-1000 chars)
  timestamp: Date,         // Creation date
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Sample Data

The project includes a seed script that populates the database with:

- 4 sample users with realistic credentials
- 4 sample channels with different content types
- 5 sample videos across various categories
- 5 sample comments for video interactions

Run the seed script in the backend:

```bash
cd Backend
npm run seed
```

---

## 🐛 Troubleshooting

### Backend won't start

- Verify MongoDB is running: `mongod`
- Check `.env` file exists and has valid `MONGO_URI`
- Ensure port 5000 is not in use
- Run `npm install` to install dependencies

### Frontend won't load

- Clear browser cache and localStorage
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify backend is running on port 5000
- Check browser console for CORS errors

### Authentication not working

- Verify JWT_SECRET in `.env` is set
- Check that tokens are being stored in localStorage
- Ensure backend and frontend URLs match in CORS configuration
- Try logging out and logging back in

### Database seeding fails

- Verify MongoDB connection string in `.env`
- Ensure MongoDB service is running
- Check MongoDB Atlas credentials if using cloud database
- Try deleting existing collections and running seed again

---

## 🎓 Key Concepts Demonstrated

- **Authentication & Authorization:** JWT tokens, password hashing, protected routes
- **Database Design:** Relationships between collections, indexing strategies
- **API Design:** RESTful principles, proper HTTP methods and status codes
- **State Management:** React Context API for global state
- **Component Architecture:** Reusable components, prop drilling solutions
- **Error Handling:** Validation, error messages, graceful fallbacks
- **Responsive Design:** Mobile-first approach, CSS Grid/Flexbox
- **Version Control:** Git workflows, meaningful commits

---

## 🧑🏻‍💻 Author

**Nikhil Sharma** <br>
GitHub: https://github.com/nikhilcodev <br>
E-mail: nikhilksharma5@gmail.com
