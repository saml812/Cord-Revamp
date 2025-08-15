const express = require('express');
const app = express();
const authRouter = require('./controllers/authController')

// call auth controllers
app.use(express.json());
app.use('/api/auth', authRouter)

module.exports = app;