require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from your GitHub Pages domain and local testing
app.use(cors({
  origin: [
    'https://marijnbaar.github.io', // GitHub Pages URL
    'http://localhost:3000'          // For local testing
  ],
  methods: ['GET', 'POST', 'DELETE'], // Add PUT/PATCH if needed
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB with an increased server selection timeout for better reliability.
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Log Mongoose connection events (for debugging)
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + process.env.MONGO_URI);
});
mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// -------------------
// Mongoose Schemas
// -------------------

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Blog Post Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});
const BlogPost = mongoose.model("BlogPost", blogSchema);

// -------------------
// Middleware: Authenticate JWT Token
// -------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  // Expected format: "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token is invalid or expired" });
    req.user = decoded; // decoded contains the payload we signed (e.g., { userId: ... })
    next();
  });
}

// -------------------
// Routes
// -------------------

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Create and return a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET All Blog Posts (Public)
app.get('/api/blogposts', async (req, res) => {
  try {
    const posts = await BlogPost.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a New Blog Post (Protected)
app.post('/api/blogposts', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new BlogPost({ title, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a Blog Post by ID (Protected)
app.delete('/api/blogposts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ message: "Post deleted successfully", post: deletedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------
// Start Server
// -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});