const express = require('express');
const postsRouter = express.Router();
const {getAllPosts, getPostsByUser} = require('../db');
const { requireUser } = require('./utils');
const { createPost } = require('../db');
const { updatePost } = require('../db')
const {getPostById} = require('../db')

//unsure if use or post goes first here!!
postsRouter.use((req, res, next) => {
  console.log("a request is being made to /posts")
  next()
})

// postsRouter.get('/', async (req, res) => {
//   const posts = await getAllPosts();
//   res.send({
//     "posts": []
//   })
// })

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    // const userPosts = await getPostsByUser(req.user.id);

    const posts = allPosts.filter(post => {
      // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }
    
      // the post is not active, but it belogs to the current user
      if (req.user && post.author.id === req.user.id) {
        return true;
      }
    
      // none of the above are true
      return false;
    });

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

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


postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});


module.exports = postsRouter