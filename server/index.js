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

// Connect to MongoDB with an increased server selection timeout
mongoose
  .connect(
    process.env
      .MONGO_URI,
    {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
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

// Log Mongoose connection events
mongoose.connection.on(
  "connected",
  () => {
    console.log(
      "Mongoose connected to " +
        process.env
          .MONGO_URI,
    );
  },
);
mongoose.connection.on(
  "error",
  (err) => {
    console.error(
      "Mongoose connection error:",
      err,
    );
  },
);
mongoose.connection.on(
  "disconnected",
  () => {
    console.log(
      "Mongoose disconnected",
    );
  },
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
    try {
      const posts =
        await BlogPost.find();
      res.json(
        posts,
      );
    } catch (err) {
      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  },
);

app.post(
  "/api/blogposts",
  async (
    req,
    res,
  ) => {
    try {
      const {
        title,
        content,
      } = req.body;
      const newPost =
        new BlogPost(
          {
            title,
            content,
          },
        );
      await newPost.save();
      res
        .status(201)
        .json(
          newPost,
        );
    } catch (err) {
      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
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
