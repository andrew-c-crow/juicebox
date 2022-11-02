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
    const posts = postByTagName.filter(post => {
      if (post.active && post.author.id !== req.user.id) {
        return true;
      }
      // if (req.user && post.author.id !== req.user.id) {
      //   return true;
      // }
      return false;
    })

    // send out an object to the client { posts: // the posts }
    res.send({ post: posts})
  } catch ({ name, message }) {
    // forward the name and message to the error handler
  }
});

module.exports = tagsRouter;