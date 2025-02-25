require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app =
  express();
const PORT =
  process.env
    .PORT || 3000;

app.use(cors());
app.use(
  express.json(),
);

// Connect to MongoDB
mongoose
  .connect(
    process.env
      .MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() =>
    console.log(
      "✅ Connected to MongoDB",
    ),
  )
  .catch((err) =>
    console.error(
      "❌ MongoDB connection error:",
      err,
    ),
  );

// Define Blog Schema
const blogSchema =
  new mongoose.Schema(
    {
      title: String,
      content:
        String,
    },
  );

const BlogPost =
  mongoose.model(
    "BlogPost",
    blogSchema,
  );

// Routes for Blog Posts
app.get(
  "/api/blogposts",
  async (
    req,
    res,
  ) => {
    const posts =
      await BlogPost.find();
    res.json(posts);
  },
);

app.post(
  "/api/blogposts",
  async (
    req,
    res,
  ) => {
    const {
      title,
      content,
    } = req.body;
    const newPost =
      new BlogPost({
        title,
        content,
      });
    await newPost.save();
    res
      .status(201)
      .json(
        newPost,
      );
  },
);

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`,
    );
  },
);
