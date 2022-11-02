const express = require('express');
const postsRouter = express.Router();
const {getAllPosts} = require('../db');
const { requireUser } = require('./utils');
const { createPost } = require('../db');
const { updatePost } = require('../db')
const {getPostById} = require('../db')

//unsure if use or post goes first here!!
postsRouter.use((req, res, next) => {
  console.log("a request is being made to /posts")
  next()
})

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();
  res.send({
    "posts": []
  })
})

// postsRouter.post('/', requireUser, async (req, res, next) => {
//   res.send({message: 'under construction'})
// })


postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {
    title,
    content
  };

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  
  postData.authorId = req.user.id
 console.log("post data here!!",postData)

  try {
    // postData = {
    //   authorId,
    //   title,
    //   content
    // }
    const post = await createPost(postData);
    // // this will create the post and the tags for us
    // // if the post comes back, res.send({ post });
    res.send({ post })
    // // otherwise, next an appropriate error object 
    next()
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter