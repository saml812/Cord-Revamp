const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user');

// Signup request
router.post('/signup', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(409).send({
                message: 'User already exists.',
                success: false,
            });
        }

        if (!req.body.password || req.body.password.length < 8) {
            return res.status(400).send({
                message: 'Password must be at least 8 characters long.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).send({
            message: 'User created successfully.',
            success: true,
        })

    } catch (error) {
        res.status(500).send({
            message: error,
            success: false,
        });
    }
});

// Login request
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({
                message: 'User does not exist.',
                success: false,
            });
        }

        const isValid = await bcrypt.compare(req.body.password, user.password);
        if (!isValid) {
            return res.status(401).send({
                message: 'Invalid password.',
                success: false,
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

        res.send({
            message: 'User logged-in successfully.',
            success: true,
            token: token,
        });

    } catch (error) {
        res.status(500).send({
            message: error,
            success: false,
        });
    }
});

module.exports = router;