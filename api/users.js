const express = require('express');
const usersRouter = express.Router();
const { getAllUsers } = require('../db');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
  
    next();
  });

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
    res.send({
        users
    });
});

usersRouter.post('/login', async (req, res, next) => {
    console.log(req.body);
    res.end();
  });

module.exports = usersRouter;