const router = require('express').Router();
const User = require('./../models/user');
const authMiddleware = require('./../middlewares/authMiddleware');

// GET currently logged-user info
router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });

        if (!user) {
            return res.status(404).send({
                message: 'User not found.',
                success: false,
            });
        }

        res.send({
            message: 'User fetched successfully.',
            success: true,
            data: user,
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false,
        });
    }
});

// GET all users except the currently logged-user
router.get('/get-all-users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.body.userId } });

        res.send({
            message: 'All users fetched successfully.',
            success: true,
            data: users,
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false,
        });
    }
});

module.exports = router;