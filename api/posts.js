const express = require('express');
const postsRouter = express.Router();
const {getAllPosts} = require('../db');
const { requireUser } = require('./utils');
const { createPost } = require('../db');

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


module.exports = postsRouter