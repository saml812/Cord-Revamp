const router = require('express').Router();
const User = require('./../models/user');
const bcrypt = require('bcryptjs');

// Signup request
router.post('/signup', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.send({
                message: 'User already exists.',
                success: false,
                status: res.statusCode,
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.send({
            message: 'User created successfully.',
            success: true,
            status: res.statusCode,
        })

    } catch (error) {
        res.send({
            message: error,
            success: false,
            status: res.statusCode,
        });
    }
});

module.exports = router;