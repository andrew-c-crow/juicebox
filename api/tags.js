const express = require('express');
const tagsRouter = express.Router();
const { getAllTags } = require('../db')
const { getPostsByTagName } = require('../db')

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags")

  next()
})

tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();
  res.send({
    tags
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  // read the tagname from the params
  const { tagName } = req.params;

  try {
    // use our method to get posts by tag name from the db
    const postByTagName = await getPostsByTagName(tagName)
    console.log("posts by filtered tag here!!",postByTagName)
    const posts = postByTagName.filter(post => {
      // if (post.active) {
      //   return true;
      // }
      if (post.active && req.user && req.user.id !== post.author.id) {
        return true;
      }
      return false;
    })

    // send out an object to the client { posts: // the posts }
    // res.send({ post: posts})
    res.send({ posts })
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    next({ name, message });
  }
});

module.exports = tagsRouter;