const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.CONN_STRING);

// Connection State
const db = mongoose.connection;

// Check for DB connection
db.on('connected', () => {
    console.log('DB connected successfully!')
});
db.on('err', () => {
    console.log('DB connection failed!')
});

module.exports = db;