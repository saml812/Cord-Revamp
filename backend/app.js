const express = require('express');
const app = express();
const authRouter = require('./controllers/authController')
const userRouter = require('./controllers/userController')

// call auth controllers
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

module.exports = app;