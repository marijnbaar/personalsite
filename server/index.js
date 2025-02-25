const express = require("express");
const cors = require("cors");
const app =
  express();
const PORT =
  process.env
    .PORT || 3000;

// Middleware
app.use(cors());
app.use(
  express.json(),
);

// Simpele in-memory database voor blogposts
let blogposts = [
  {
    id: 1,
    title:
      "Mijn eerste blogpost",
    content:
      "Dit is mijn eerste blogpost!",
  },
  {
    id: 2,
    title:
      "Azure OpenAI & DevOps",
    content:
      "Hoe ik AI en DevOps samenbreng in mijn werk.",
  },
];

// API-endpoint om alle blogposts op te halen
app.get(
  "/api/blogposts",
  (req, res) => {
    res.json(
      blogposts,
    );
  },
);

// API-endpoint om een nieuwe blogpost toe te voegen
app.post(
  "/api/blogposts",
  (req, res) => {
    const {
      title,
      content,
    } = req.body;
    if (
      !title ||
      !content
    ) {
      return res
        .status(400)
        .json({
          error:
            "Titel en inhoud zijn verplicht",
        });
    }
    const newPost =
      {
        id:
          blogposts.length +
          1,
        title,
        content,
      };
    blogposts.push(
      newPost,
    );
    res
      .status(201)
      .json(
        newPost,
      );
  },
);

// API-endpoint om een blogpost te verwijderen
app.delete(
  "/api/blogposts/:id",
  (req, res) => {
    const postId =
      parseInt(
        req.params
          .id,
      );
    blogposts =
      blogposts.filter(
        (post) =>
          post.id !==
          postId,
      );
    res.json({
      message:
        "Blogpost verwijderd",
    });
  },
);

// Start server
app.listen(
  PORT,
  () => {
    console.log(
      `Server draait op http://localhost:${PORT}`,
    );
  },
);
